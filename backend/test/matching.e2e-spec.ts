import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const MEMBER_EMAIL = `match-member-${Date.now()}@dsvtn.vn`

describe('Matching (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminToken: string
  let memberToken: string
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

    const login = await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }).expect(200)
    adminToken = login.body.accessToken

    const createMember = await request(app.getHttpServer())
      .post('/api/admin/users').set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Match Member', email: MEMBER_EMAIL, role: 'MEMBER' }).expect(201)
    const memberLogin = await request(app.getHttpServer())
      .post('/api/auth/login').send({ email: MEMBER_EMAIL, password: createMember.body.temporaryPassword }).expect(200)
    memberToken = memberLogin.body.accessToken

    const act = await request(app.getHttpServer())
      .post('/api/admin/activities').set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Match E2E', startTime: '2026-10-01T08:00:00Z', endTime: '2026-10-01T17:00:00Z' }).expect(201)
    activityId = act.body.id

    const task = await request(app.getHttpServer())
      .post(`/api/admin/activities/${activityId}/tasks`).set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Task A', slotCount: 1 }).expect(201)
    taskId = task.body.id

    await request(app.getHttpServer())
      .patch(`/api/admin/activities/${activityId}`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'OPEN' }).expect(200)

    await request(app.getHttpServer())
      .post(`/api/member/activities/${activityId}/registrations`).set('Authorization', `Bearer ${memberToken}`)
      .send({ preferences: [{ taskId, score: 3 }] }).expect(201)

    await request(app.getHttpServer())
      .patch(`/api/admin/activities/${activityId}`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'CLOSED' }).expect(200)
  })

  afterAll(async () => {
    await prisma.assignment.deleteMany({ where: { activityId } })
    await prisma.taskPreference.deleteMany({ where: { task: { activityId } } })
    await prisma.activityRegistration.deleteMany({ where: { activityId } })
    await prisma.task.deleteMany({ where: { activityId } })
    await prisma.activity.deleteMany({ where: { id: activityId } })
    await prisma.user.deleteMany({ where: { email: MEMBER_EMAIL } })
    await app.close()
  })

  it('runs matcher, saves assignments, and marks activity MATCHED', async () => {
    const run = await request(app.getHttpServer())
      .post(`/api/admin/activities/${activityId}/matcher/run`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201)

    expect(run.body.activityId).toBe(activityId)
    expect(run.body.assignments).toEqual([{ userId: expect.any(String), taskId, source: 'MATCHER' }])

    const activity = await request(app.getHttpServer())
      .get(`/api/admin/activities/${activityId}`).set('Authorization', `Bearer ${adminToken}`).expect(200)
    expect(activity.body.status).toBe('MATCHED')

    const assignments = await request(app.getHttpServer())
      .get(`/api/admin/activities/${activityId}/assignments`).set('Authorization', `Bearer ${adminToken}`).expect(200)
    expect(assignments.body).toHaveLength(1)
  })

  it('member sees only own assignment', async () => {
    const mine = await request(app.getHttpServer())
      .get(`/api/member/activities/${activityId}/assignments`).set('Authorization', `Bearer ${memberToken}`).expect(200)
    expect(mine.body).toHaveLength(1)
    expect(mine.body[0].taskId).toBe(taskId)
  })

  it('rerun after MATCHED → 409', async () => {
    await request(app.getHttpServer())
      .post(`/api/admin/activities/${activityId}/matcher/run`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(409)
  })
})
