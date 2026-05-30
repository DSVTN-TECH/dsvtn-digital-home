import { INestApplication, ValidationPipe } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { DomainEvents } from '../src/common/events/domain-events'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthSession, loginAndChangePassword, loginSession, withAuth } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const MEMBER_EMAIL = `reports-member-${Date.now()}@dsvtn.vn`

describe('Reports (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let events: EventEmitter2
  let adminSession: AuthSession
  let memberSession: AuthSession
  let activityId: string
  let productId: string
  let orderId: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()
    prisma = app.get(PrismaService)
    events = app.get(EventEmitter2)

    adminSession = await loginSession(app, ADMIN_EMAIL, ADMIN_PASSWORD)
    const created = await withAuth(
      request(app.getHttpServer()).post('/api/admin/users'),
      adminSession,
      true,
    )
      .send({ fullName: 'Reports Member', email: MEMBER_EMAIL, role: 'MEMBER' }).expect(201)
    memberSession = await loginAndChangePassword(
      app,
      MEMBER_EMAIL,
      created.body.temporaryPassword,
      'reports-password-123',
    )

    const activity = await withAuth(
      request(app.getHttpServer()).post('/api/admin/activities'),
      adminSession,
      true,
    )
      .send({ title: 'Reports E2E Activity', startTime: '2026-11-01T08:00:00Z', endTime: '2026-11-01T17:00:00Z' }).expect(201)
    activityId = activity.body.id

    const product = await withAuth(
      request(app.getHttpServer()).post('/api/admin/products'),
      adminSession,
      true,
    )
      .send({ name: 'Reports Product', priceCents: 99000 }).expect(201)
    productId = product.body.id

    const order = await request(app.getHttpServer())
      .post('/api/public/orders')
      .set('X-Forwarded-For', '198.51.200.10')
      .set('Idempotency-Key', `reports-order-${Date.now()}`)
      .send({
        customerName: 'Reports Buyer',
        customerPhone: '0900000000',
        customerAddress: '123 Report Street',
        paymentProofUrl: 'https://example.com/proof.jpg',
        items: [{ productId, quantity: 2 }],
      })
      .expect(201)
    orderId = order.body.id
    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/orders/${orderId}`),
      adminSession,
      true,
    )
      .send({ status: 'CONFIRMED' }).expect(200)
  })

  afterAll(async () => {
    if (orderId) await prisma.orderItem.deleteMany({ where: { orderId } })
    if (orderId) await prisma.order.deleteMany({ where: { id: orderId } })
    if (productId) await prisma.product.deleteMany({ where: { id: productId } })
    if (activityId) await prisma.activity.deleteMany({ where: { id: activityId } })
    await prisma.user.deleteMany({ where: { email: MEMBER_EMAIL } })
    await app.close()
  })

  it('requires ADMIN role', async () => {
    await request(app.getHttpServer()).get('/api/admin/reports/dashboard').expect(401)
    await withAuth(request(app.getHttpServer()).get('/api/admin/reports/dashboard'), memberSession)
      .expect(403)
  })

  it('returns cached dashboard KPIs and invalidates on domain event', async () => {
    const first = await withAuth(
      request(app.getHttpServer()).get('/api/admin/reports/dashboard'),
      adminSession,
    ).expect(200)
    await withAuth(
      request(app.getHttpServer()).get('/api/admin/reports/dashboard'),
      adminSession,
    ).expect(200)

    expect(first.body.kpis.totalUsers).toEqual(expect.any(Number))

    events.emit(DomainEvents.matcherRun, { userId: 'noop', sourceId: `reports-e2e-${Date.now()}` })
    await new Promise((resolve) => setTimeout(resolve, 25))

    const third = await withAuth(
      request(app.getHttpServer()).get('/api/admin/reports/dashboard'),
      adminSession,
    ).expect(200)
    expect(third.body.generatedAt).not.toBe(first.body.generatedAt)
  })

  it('returns filtered paginated activity overview', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).get('/api/admin/reports/overview?dataset=activities&status=DRAFT&page=1&pageSize=10'),
      adminSession,
    ).expect(200)

    expect(res.body.dataset).toBe('activities')
    expect(res.body.pagination.page).toBe(1)
    expect(res.body.items.some((row: { id: string }) => row.id === activityId)).toBe(true)
  })

  it('returns order overview and CSV export', async () => {
    const overview = await withAuth(
      request(app.getHttpServer()).get('/api/admin/reports/overview?dataset=orders&status=CONFIRMED&page=1&pageSize=10'),
      adminSession,
    ).expect(200)
    expect(overview.body.items.some((row: { id: string; totalCents: number }) => row.id === orderId && row.totalCents === 198000)).toBe(true)

    const csv = await withAuth(
      request(app.getHttpServer()).get('/api/admin/reports/overview.csv?dataset=orders&status=CONFIRMED'),
      adminSession,
    ).expect(200)
    expect(csv.text).toContain('id,customerName,status,itemCount,totalCents,createdAt')
    expect(csv.text).toContain(orderId)
  })
})
