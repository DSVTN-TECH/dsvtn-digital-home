import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthSession, loginAndChangePassword, loginSession, withAuth } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const MEMBER_EMAIL = `act-member-${Date.now()}@dsvtn.vn`

describe('Activities (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminSession: AuthSession
  let memberSession: AuthSession
  let activityId: string

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
      .send({ fullName: 'Act Member', email: MEMBER_EMAIL, role: 'MEMBER' }).expect(201)
    memberSession = await loginAndChangePassword(
      app,
      MEMBER_EMAIL,
      createMember.body.temporaryPassword,
      'act-password-123',
    )
  })

  afterAll(async () => {
    if (activityId) await prisma.activity.deleteMany({ where: { id: activityId } })
    await prisma.user.deleteMany({ where: { email: MEMBER_EMAIL } })
    await app.close()
  })

  it('admin creates activity → 201', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).post('/api/admin/activities'),
      adminSession,
      true,
    )
      .send({ title: 'E2E Activity', startTime: '2026-07-01T08:00:00Z', endTime: '2026-07-01T17:00:00Z' })
      .expect(201)
    expect(res.body.id).toBeDefined()
    expect(res.body.status).toBe('DRAFT')
    activityId = res.body.id
  })

  it('admin lists activities includes created one', async () => {
    const res = await withAuth(request(app.getHttpServer()).get('/api/admin/activities'), adminSession).expect(200)
    expect(res.body.some((a: { id: string }) => a.id === activityId)).toBe(true)
  })

  it('invalid transition DRAFT → COMPLETED → 422', async () => {
    await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/activities/${activityId}`),
      adminSession,
      true,
    )
      .send({ status: 'COMPLETED' }).expect(422)
  })

  it('valid transition DRAFT → OPEN', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/activities/${activityId}`),
      adminSession,
      true,
    )
      .send({ status: 'OPEN' }).expect(200)
    expect(res.body.status).toBe('OPEN')
  })

  it('member sees OPEN activity', async () => {
    const res = await withAuth(request(app.getHttpServer()).get('/api/member/activities'), memberSession).expect(200)
    expect(res.body.some((a: { id: string }) => a.id === activityId)).toBe(true)
  })

  it('valid transition OPEN → CLOSED', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/activities/${activityId}`),
      adminSession,
      true,
    )
      .send({ status: 'CLOSED' }).expect(200)
    expect(res.body.status).toBe('CLOSED')
  })

  it('member cannot see CLOSED activity in OPEN list', async () => {
    const res = await withAuth(request(app.getHttpServer()).get('/api/member/activities'), memberSession).expect(200)
    expect(res.body.some((a: { id: string }) => a.id === activityId)).toBe(false)
  })
})

describe('Tasks (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminSession: AuthSession
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

    adminSession = await loginSession(app, 'admin@dsvtn.vn', 'changeme')

    const act = await withAuth(
      request(app.getHttpServer()).post('/api/admin/activities'),
      adminSession,
      true,
    )
      .send({ title: 'Task E2E Activity', startTime: '2026-08-01T08:00:00Z', endTime: '2026-08-01T17:00:00Z' })
      .expect(201)
    activityId = act.body.id
  })

  afterAll(async () => {
    if (taskId) await prisma.task.deleteMany({ where: { id: taskId } })
    if (activityId) await prisma.activity.deleteMany({ where: { id: activityId } })
    await app.close()
  })

  it('create task → 201 with correct activityId', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).post(`/api/admin/activities/${activityId}/tasks`),
      adminSession,
      true,
    )
      .send({ name: 'Hậu cần', slotCount: 3, priority: 1 })
      .expect(201)
    expect(res.body.activityId).toBe(activityId)
    expect(res.body.slotCount).toBe(3)
    taskId = res.body.id
  })

  it('list tasks for activity', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).get(`/api/admin/activities/${activityId}/tasks`),
      adminSession,
    )
      .expect(200)
    expect(res.body.some((t: { id: string }) => t.id === taskId)).toBe(true)
  })

  it('slotCount < 0 → 400', async () => {
    await withAuth(
      request(app.getHttpServer()).post(`/api/admin/activities/${activityId}/tasks`),
      adminSession,
      true,
    )
      .send({ name: 'Bad', slotCount: -1 })
      .expect(400)
  })

  it('create task for non-existent activity → 404', async () => {
    await withAuth(
      request(app.getHttpServer()).post('/api/admin/activities/00000000-0000-0000-0000-000000000000/tasks'),
      adminSession,
      true,
    )
      .send({ name: 'X', slotCount: 1 })
      .expect(404)
  })

  it('update task slotCount + priority', async () => {
    const res = await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/tasks/${taskId}`),
      adminSession,
      true,
    )
      .send({ slotCount: 5, priority: 2 })
      .expect(200)
    expect(res.body.slotCount).toBe(5)
    expect(res.body.priority).toBe(2)
  })
})
