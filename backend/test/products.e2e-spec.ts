import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'

describe('Products (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminToken: string
  let productId: string

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
  })

  afterAll(async () => {
    if (productId) await prisma.product.deleteMany({ where: { id: productId } })
    await app.close()
  })

  it('admin creates product → 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/products').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'E2E Polo', priceCents: 150000 }).expect(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.status).toBe('ACTIVE')
    productId = res.body.id
  })

  it('priceCents <= 0 → 400', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/products').set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Bad', priceCents: 0 }).expect(400)
  })

  it('public lists active products including created', async () => {
    const res = await request(app.getHttpServer()).get('/api/public/products').expect(200)
    expect(res.body.some((p: { id: string }) => p.id === productId)).toBe(true)
  })

  it('public cannot see INACTIVE product', async () => {
    await request(app.getHttpServer())
      .patch(`/api/admin/products/${productId}`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'INACTIVE' }).expect(200)

    await request(app.getHttpServer()).get(`/api/public/products/${productId}`).expect(404)

    const list = await request(app.getHttpServer()).get('/api/public/products').expect(200)
    expect(list.body.some((p: { id: string }) => p.id === productId)).toBe(false)
  })

  it('admin sees all products including INACTIVE', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/products').set('Authorization', `Bearer ${adminToken}`).expect(200)
    expect(res.body.some((p: { id: string }) => p.id === productId)).toBe(true)
  })
})
