import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthSession, loginAndChangePassword, loginSession, withAuth } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const MEMBER_EMAIL = `va-member-${Date.now()}@dsvtn.vn`
const APP_EMAIL = `va-app-${Date.now()}@example.com`

describe('Volunteer Applications (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminSession: AuthSession
  let memberSession: AuthSession
  let applicationId: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    )
    await app.init()

    prisma = app.get(PrismaService)

    adminSession = await loginSession(app, ADMIN_EMAIL, ADMIN_PASSWORD)

    const createMember = await withAuth(
      request(app.getHttpServer()).post('/api/admin/users'),
      adminSession,
      true,
    )
      .send({ fullName: 'VA Member', email: MEMBER_EMAIL, role: 'MEMBER' })
      .expect(201)

    memberSession = await loginAndChangePassword(
      app,
      MEMBER_EMAIL,
      createMember.body.temporaryPassword,
      'va-password-123',
    )
  })

  afterAll(async () => {
    if (applicationId) {
      await prisma.volunteerApplication.deleteMany({ where: { id: applicationId } })
    }
    await prisma.user.deleteMany({ where: { email: MEMBER_EMAIL } })
    await app.close()
  })

  it('public submit works and studentId is required', async () => {
    const ok = await request(app.getHttpServer())
      .post('/api/public/volunteer-applications')
      .send({
        fullName: 'Tran Thi C',
        email: APP_EMAIL,
        phone: '0912345678',
        studentId: 'SV001',
        note: 'Available on weekends',
      })
      .expect(201)

    expect(ok.body.id).toBeDefined()
    expect(ok.body.status).toBe('PENDING')
    expect(ok.body.createdAt).toBeDefined()
    applicationId = ok.body.id

    await request(app.getHttpServer())
      .post('/api/public/volunteer-applications')
      .send({
        fullName: 'Tran Thi C',
        email: 'missing-student@example.com',
        phone: '0912345678',
      })
      .expect(400)
  })

  it('admin list requires ADMIN role', async () => {
    await request(app.getHttpServer()).get('/api/admin/volunteer-applications').expect(401)

    await request(app.getHttpServer())
      .get('/api/admin/volunteer-applications')
      .set('Cookie', memberSession.cookies)
      .expect(403)

    const list = await withAuth(
      request(app.getHttpServer()).get('/api/admin/volunteer-applications?status=PENDING'),
      adminSession,
    )
      .expect(200)

    expect(Array.isArray(list.body)).toBe(true)
    expect(list.body.some((a: { id: string }) => a.id === applicationId)).toBe(true)
  })

  it('admin review updates status and reviewedBy/reviewedAt', async () => {
    const reviewed = await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/volunteer-applications/${applicationId}`),
      adminSession,
      true,
    )
      .send({ status: 'APPROVED' })
      .expect(200)

    expect(reviewed.body.status).toBe('APPROVED')
    expect(reviewed.body.reviewedById).toBeDefined()
    expect(reviewed.body.reviewedAt).toBeDefined()

    const approved = await withAuth(
      request(app.getHttpServer()).get('/api/admin/volunteer-applications?status=APPROVED'),
      adminSession,
    )
      .expect(200)

    expect(approved.body.some((a: { id: string }) => a.id === applicationId)).toBe(true)
  })
})
