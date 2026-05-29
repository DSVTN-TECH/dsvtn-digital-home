import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const MEMBER_EMAIL = `act-member-${Date.now()}@dsvtn.vn`

describe('Activities (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminToken: string
  let memberToken: string
  let activityId: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()
    prisma = app.get(PrismaService)

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }).expect(200)
    adminToken = adminLogin.body.accessToken

    const createMember = await request(app.getHttpServer())
      .post('/api/admin/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Act Member', email: MEMBER_EMAIL, role: 'MEMBER' }).expect(201)
    const memberLogin = await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: MEMBER_EMAIL, password: createMember.body.temporaryPassword }).expect(200)
    memberToken = memberLogin.body.accessToken
  })

  afterAll(async () => {
    if (activityId) await prisma.activity.deleteMany({ where: { id: activityId } })
    await prisma.user.deleteMany({ where: { email: MEMBER_EMAIL } })
    await app.close()
  })

  it('admin creates activity → 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/activities').set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'E2E Activity', startTime: '2026-07-01T08:00:00Z', endTime: '2026-07-01T17:00:00Z' })
      .expect(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.status).toBe('DRAFT')
    activityId = res.body.id
  })

  it('admin lists activities includes created one', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/admin/activities').set('Authorization', `Bearer ${adminToken}`).expect(200)
    expect(res.body.some((a: { id: string }) => a.id === activityId)).toBe(true)
  })

  it('invalid transition DRAFT → COMPLETED → 422', async () => {
    await request(app.getHttpServer())
      .patch(`/api/admin/activities/${activityId}`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' }).expect(422)
  })

  it('valid transition DRAFT → OPEN', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/activities/${activityId}`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'OPEN' }).expect(200)
    expect(res.body.status).toBe('OPEN')
  })

  it('member sees OPEN activity', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/member/activities').set('Authorization', `Bearer ${memberToken}`).expect(200)
    expect(res.body.some((a: { id: string }) => a.id === activityId)).toBe(true)
  })

  it('valid transition OPEN → CLOSED', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/admin/activities/${activityId}`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CLOSED' }).expect(200)
    expect(res.body.status).toBe('CLOSED')
  })

  it('member cannot see CLOSED activity in OPEN list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/member/activities').set('Authorization', `Bearer ${memberToken}`).expect(200)
    expect(res.body.some((a: { id: string }) => a.id === activityId)).toBe(false)
  })
})
