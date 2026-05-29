import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const NEW_USER_EMAIL = `e2e-member-${Date.now()}@dsvtn.vn`

describe('Auth + RBAC + Users (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminToken: string
  let memberToken: string
  let memberTempPassword: string

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
  })

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: NEW_USER_EMAIL } })
    await app.close()
  })

  describe('POST /api/auth/login', () => {
    it('returns JWT + user on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(200)

      expect(res.body.accessToken).toEqual(expect.any(String))
      expect(res.body.user).toMatchObject({ email: ADMIN_EMAIL, role: 'ADMIN' })
      expect(res.body.user).not.toHaveProperty('passwordHash')
      adminToken = res.body.accessToken
    })

    it('returns 401 on wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: 'wrong-password' })
        .expect(401)

      expect(res.body.message).toBe('Invalid credentials')
      expect(res.body.code).toBe('UNAUTHENTICATED')
    })

    it('returns 400 on missing body fields', async () => {
      await request(app.getHttpServer()).post('/api/auth/login').send({}).expect(400)
    })
  })

  describe('RBAC on /api/admin/users', () => {
    it('returns 401 without Authorization header', async () => {
      await request(app.getHttpServer()).get('/api/admin/users').expect(401)
    })

    it('allows ADMIN to list users (no passwordHash leaked)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(Array.isArray(res.body)).toBe(true)
      for (const user of res.body) {
        expect(user).not.toHaveProperty('passwordHash')
      }
    })
  })

  describe('User provisioning flow', () => {
    it('ADMIN creates user → 201 with temporaryPassword', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullName: 'E2E Member', email: NEW_USER_EMAIL, role: 'MEMBER' })
        .expect(201)

      expect(res.body.temporaryPassword).toEqual(expect.any(String))
      expect(res.body).not.toHaveProperty('passwordHash')
      memberTempPassword = res.body.temporaryPassword
    })

    it('duplicate email → 409', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ fullName: 'Dup', email: NEW_USER_EMAIL, role: 'MEMBER' })
        .expect(409)
    })

    it('new member can login with temporaryPassword', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: NEW_USER_EMAIL, password: memberTempPassword })
        .expect(200)

      memberToken = res.body.accessToken
      expect(memberToken).toEqual(expect.any(String))
    })

    it('MEMBER is forbidden from admin route → 403', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403)
    })

    it('PATCH non-existent user → 404', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'DISABLED' })
        .expect(404)
    })
  })
})
