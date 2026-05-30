import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthSession, loginAndChangePassword, loginSession, withAuth } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const LOGISTIC_EMAIL = `campaign-logistic-${Date.now()}@dsvtn.vn`

describe('Campaigns + fundraising (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let admin: AuthSession
  let logistic: AuthSession
  let campaignId: string
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

    admin = await loginSession(app, ADMIN_EMAIL, ADMIN_PASSWORD)
    const createdLogistic = await withAuth(
      request(app.getHttpServer()).post('/api/admin/users'),
      admin,
      true,
    )
      .send({ fullName: 'Campaign Logistic', email: LOGISTIC_EMAIL, role: 'LOGISTIC' }).expect(201)
    logistic = await loginAndChangePassword(
      app,
      LOGISTIC_EMAIL,
      createdLogistic.body.temporaryPassword,
      'campaign-logistic-123',
    )
  })

  afterAll(async () => {
    if (orderId) await prisma.orderItem.deleteMany({ where: { orderId } })
    if (orderId) await prisma.order.deleteMany({ where: { id: orderId } })
    if (productId) await prisma.product.deleteMany({ where: { id: productId } })
    if (campaignId) await prisma.campaign.deleteMany({ where: { id: campaignId } })
    await prisma.user.deleteMany({ where: { email: LOGISTIC_EMAIL } })
    await app.close()
  })

  it('admin creates campaign and public can read active campaign', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).post('/api/admin/campaigns'),
      admin,
      true,
    )
      .send({
        title: 'E2E Fundraising Campaign',
        description: 'Campaign e2e',
        coverImageUrl: 'https://example.com/campaign.jpg',
        goalCents: 1000000,
        startDate: '2026-06-01',
        endDate: '2026-07-01',
        status: 'ACTIVE',
      })
      .expect(201)
    campaignId = res.body.id

    const list = await request(app.getHttpServer()).get('/api/public/campaigns').expect(200)
    expect(list.body.some((item: { id: string }) => item.id === campaignId)).toBe(true)

    const detail = await request(app.getHttpServer())
      .get(`/api/public/campaigns/${campaignId}`)
      .expect(200)
    expect(detail.body.progress).toMatchObject({ raisedCents: 0, orderCount: 0, percent: 0 })
  })

  it('admin updates campaign and validates dates', async () => {
    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/campaigns/${campaignId}`),
      admin,
      true,
    )
      .send({ title: 'Updated Fundraising Campaign' })
      .expect(200)

    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/campaigns/${campaignId}`),
      admin,
      true,
    )
      .send({ startDate: '2026-08-01', endDate: '2026-07-01' })
      .expect(422)
  })

  it('orders linked to campaign update progress and transactions', async () => {
    const product = await withAuth(
      request(app.getHttpServer()).post('/api/admin/products'),
      admin,
      true,
    )
      .send({ name: 'Campaign E2E Product', priceCents: 125000 })
      .expect(201)
    productId = product.body.id

    const order = await request(app.getHttpServer())
      .post('/api/public/orders')
      .set('X-Forwarded-For', '198.51.210.10')
      .set('Idempotency-Key', `campaign-order-${Date.now()}`)
      .send({
        customerName: 'Campaign Buyer',
        customerPhone: '0900000000',
        customerAddress: 'Campaign Address',
        paymentProofUrl: 'https://example.com/proof.jpg',
        campaignId,
        items: [{ productId, quantity: 2 }],
      })
      .expect(201)
    orderId = order.body.id

    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/orders/${orderId}`),
      admin,
      true,
    )
      .send({ status: 'CONFIRMED' })
      .expect(200)

    const detail = await request(app.getHttpServer())
      .get(`/api/public/campaigns/${campaignId}`)
      .expect(200)
    expect(detail.body.progress).toMatchObject({ raisedCents: 250000, orderCount: 1, percent: 25 })

    const transactions = await withAuth(
      request(app.getHttpServer()).get(`/api/admin/fundraising/transactions?campaignId=${campaignId}`),
      logistic,
    ).expect(200)
    expect(transactions.body.items.some((item: { id: string }) => item.id === orderId)).toBe(true)
  })

  it('admin campaign list requires admin role', async () => {
    await request(app.getHttpServer()).get('/api/admin/campaigns').expect(401)
    await withAuth(request(app.getHttpServer()).get('/api/admin/campaigns'), logistic).expect(403)
  })
})
