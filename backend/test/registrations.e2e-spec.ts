import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthSession, loginAndChangePassword, loginSession, withAuth } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const MEMBER_EMAIL = `reg-member-${Date.now()}@dsvtn.vn`

describe('Registrations (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminSession: AuthSession
  let memberSession: AuthSession
  let activityId: string
  let taskId: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()
    prisma = app.get(PrismaService)

    adminSession = await loginSession(app, ADMIN_EMAIL, ADMIN_PASSWORD)

    const createMember = await withAuth(
      request(app.getHttpServer()).post('/api/admin/users'),
      adminSession,
      true,
    )
      .send({ fullName: 'Reg Member', email: MEMBER_EMAIL, role: 'MEMBER' }).expect(201)
    memberSession = await loginAndChangePassword(
      app,
      MEMBER_EMAIL,
      createMember.body.temporaryPassword,
      'reg-password-123',
    )

    const act = await withAuth(
      request(app.getHttpServer()).post('/api/admin/activities'),
      adminSession,
      true,
    )
      .send({ title: 'Reg E2E', startTime: '2026-09-01T08:00:00Z', endTime: '2026-09-01T17:00:00Z' }).expect(201)
    activityId = act.body.id

    const task = await withAuth(
      request(app.getHttpServer()).post(`/api/admin/activities/${activityId}/tasks`),
      adminSession,
      true,
    )
      .send({ name: 'Task A', slotCount: 2 }).expect(201)
    taskId = task.body.id

    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/activities/${activityId}`),
      adminSession,
      true,
    )
      .send({ status: 'OPEN' }).expect(200)
  })

  afterAll(async () => {
    await prisma.taskPreference.deleteMany({ where: { task: { activityId } } })
    await prisma.activityRegistration.deleteMany({ where: { activityId } })
    await prisma.task.deleteMany({ where: { activityId } })
    await prisma.activity.deleteMany({ where: { id: activityId } })
    await prisma.user.deleteMany({ where: { email: MEMBER_EMAIL } })
    await app.close()
  })

  it('member submits registration with preferences', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).post(`/api/member/activities/${activityId}/registrations`),
      memberSession,
      true,
    )
      .send({ preferences: [{ taskId, score: 3 }] })
      .expect(201)
    expect(res.body.preferences).toHaveLength(1)
    expect(res.body.preferences[0].score).toBe(3)
  })

  it('duplicate registration → 409', async () => {
    await withAuth(
      request(app.getHttpServer()).post(`/api/member/activities/${activityId}/registrations`),
      memberSession,
      true,
    )
      .send({ preferences: [{ taskId, score: 1 }] })
      .expect(409)
  })

  it('score out of range → 400', async () => {
    await withAuth(
      request(app.getHttpServer()).post(`/api/member/activities/${activityId}/registrations`),
      adminSession,
      true,
    )
      .send({ preferences: [{ taskId, score: 5 }] })
      .expect(400)
  })

  it('registration on non-OPEN activity → 422', async () => {
    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/activities/${activityId}`),
      adminSession,
      true,
    )
      .send({ status: 'CLOSED' }).expect(200)

    await withAuth(
      request(app.getHttpServer()).post(`/api/member/activities/${activityId}/registrations`),
      adminSession,
      true,
    )
      .send({ preferences: [] })
      .expect(422)
  })

  it('admin lists registrations', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).get(`/api/admin/activities/${activityId}/registrations`),
      adminSession,
    )
      .expect(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThanOrEqual(1)
  })
})
