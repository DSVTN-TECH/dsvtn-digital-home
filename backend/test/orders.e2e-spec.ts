import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthSession, loginAndChangePassword, loginSession, withAuth } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const MEMBER_EMAIL = `e2e-orders-member-${Date.now()}@dsvtn.vn`

describe('Orders (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminSession: AuthSession
  let memberSession: AuthSession
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

    adminSession = await loginSession(app, ADMIN_EMAIL, ADMIN_PASSWORD)

    const created = await withAuth(
      request(app.getHttpServer()).post('/api/admin/users'),
      adminSession,
      true,
    )
      .send({ fullName: 'Orders E2E Member', email: MEMBER_EMAIL, role: 'MEMBER' }).expect(201)
    memberSession = await loginAndChangePassword(
      app,
      MEMBER_EMAIL,
      created.body.temporaryPassword,
      'orders-password-123',
    )

    const product = await withAuth(
      request(app.getHttpServer()).post('/api/admin/products'),
      adminSession,
      true,
    )
      .send({ name: 'Order E2E Product', priceCents: 120000 }).expect(201)
    productId = product.body.id
  })

  afterAll(async () => {
    if (orderId) await prisma.orderItem.deleteMany({ where: { orderId } })
    if (orderId) await prisma.order.deleteMany({ where: { id: orderId } })
    if (productId) await prisma.product.deleteMany({ where: { id: productId } })
    await prisma.user.deleteMany({ where: { email: MEMBER_EMAIL } })
    await app.close()
  })

  it('creates order with status PENDING_PAYMENT_REVIEW', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/public/orders')
      .send({
        customerName: 'Le Thi D',
        customerPhone: '0987654321',
        customerAddress: '123 Nguyen Hue, Q1, HCM',
        paymentProofUrl: 'https://example.com/proof.jpg',
        items: [{ productId, quantity: 2 }],
      })
      .expect(201)

    expect(res.body.status).toBe('PENDING_PAYMENT_REVIEW')
    orderId = res.body.id

    const detail = await withAuth(
      request(app.getHttpServer()).get(`/api/admin/orders/${orderId}`),
      adminSession,
    )
      .expect(200)

    expect(detail.body.items[0].unitPriceCents).toBe(120000)
  })

  it('admin updates order status PENDING_PAYMENT_REVIEW → CONFIRMED', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/orders/${orderId}`),
      adminSession,
      true,
    )
      .send({ status: 'CONFIRMED' })
      .expect(200)

    expect(res.body.status).toBe('CONFIRMED')
  })

  it('invalid transition CONFIRMED → REJECTED → 422', async () => {
    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/orders/${orderId}`),
      adminSession,
      true,
    )
      .send({ status: 'REJECTED' })
      .expect(422)
  })

  it('MEMBER cannot update order status → 403', async () => {
    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/orders/${orderId}`),
      memberSession,
      true,
    )
      .send({ status: 'CANCELLED' })
      .expect(403)
  })

  it('paymentProofUrl not https → 400', async () => {
    await request(app.getHttpServer())
      .post('/api/public/orders')
      .send({
        customerName: 'A', customerPhone: '0912345678', customerAddress: 'HCM',
        paymentProofUrl: 'http://insecure.com/proof.jpg', items: [{ productId, quantity: 1 }],
      })
      .expect(400)
  })

  it('quantity <= 0 → 400', async () => {
    await request(app.getHttpServer())
      .post('/api/public/orders')
      .send({
        customerName: 'A', customerPhone: '0912345678', customerAddress: 'HCM',
        paymentProofUrl: 'https://example.com/proof.jpg', items: [{ productId, quantity: 0 }],
      })
      .expect(400)
  })

  it('product INACTIVE → 422', async () => {
    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/products/${productId}`),
      adminSession,
      true,
    )
      .send({ status: 'INACTIVE' }).expect(200)

    await request(app.getHttpServer())
      .post('/api/public/orders')
      .send({
        customerName: 'A', customerPhone: '0912345678', customerAddress: 'HCM',
        paymentProofUrl: 'https://example.com/proof.jpg', items: [{ productId, quantity: 1 }],
      })
      .expect(422)
  })
})
