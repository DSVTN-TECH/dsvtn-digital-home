import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'

describe('Orders (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminToken: string
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

    const login = await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }).expect(200)
    adminToken = login.body.accessToken

    const product = await request(app.getHttpServer())
      .post('/api/admin/products').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Order E2E Product', priceCents: 120000 }).expect(201)
    productId = product.body.id
  })

  afterAll(async () => {
    if (orderId) await prisma.orderItem.deleteMany({ where: { orderId } })
    if (orderId) await prisma.order.deleteMany({ where: { id: orderId } })
    if (productId) await prisma.product.deleteMany({ where: { id: productId } })
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

    const detail = await request(app.getHttpServer())
      .get(`/api/admin/orders/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)

    expect(detail.body.items[0].unitPriceCents).toBe(120000)
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
    await request(app.getHttpServer())
      .patch(`/api/admin/products/${productId}`).set('Authorization', `Bearer ${adminToken}`)
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
