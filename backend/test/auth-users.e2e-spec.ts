import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { csrfMiddleware } from '../src/common/security/csrf.middleware'
import { PrismaService } from '../src/prisma/prisma.service'
import { e2eClientIp, sessionFromResponse } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const NEW_USER_EMAIL = `e2e-member-${Date.now()}@dsvtn.vn`

describe('Auth + RBAC + Users (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminCookies: string[]
  let csrfToken: string
  let memberCookies: string[]
  let memberCsrfToken: string
  let memberTempPassword: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.use(csrfMiddleware)
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
    it('sets httpOnly cookies + returns user on valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', e2eClientIp())
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        .expect(200)

      expect(res.body.user).toMatchObject({
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        mustChangePassword: false,
      })
      expect(res.body.user).not.toHaveProperty('passwordHash')
      const setCookie = res.headers['set-cookie'] as unknown as string[]
      expect(setCookie.some((cookie) => cookie.startsWith('dsvtn_access=') && cookie.includes('HttpOnly'))).toBe(true)
      expect(setCookie.some((cookie) => cookie.startsWith('dsvtn_refresh=') && cookie.includes('HttpOnly'))).toBe(true)
      expect(setCookie.some((cookie) => cookie.startsWith('dsvtn_csrf='))).toBe(true)
      const session = sessionFromResponse(res)
      adminCookies = session.cookies
      csrfToken = session.csrfToken
    })

    it('returns current user from cookie auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Cookie', adminCookies)
        .expect(200)

      expect(res.body.user).toMatchObject({
        email: ADMIN_EMAIL,
        role: 'ADMIN',
        mustChangePassword: false,
      })
    })

    it('returns 401 on wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', e2eClientIp())
        .send({ email: ADMIN_EMAIL, password: 'wrong-password' })
        .expect(401)

      expect(res.body.message).toBe('Invalid credentials')
      expect(res.body.code).toBe('UNAUTHENTICATED')
    })

    it('returns 400 on missing body fields', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', e2eClientIp())
        .send({})
        .expect(400)
    })
  })

  describe('RBAC on /api/admin/users', () => {
    it('returns 401 without Authorization header', async () => {
      await request(app.getHttpServer()).get('/api/admin/users').expect(401)
    })

    it('allows ADMIN to list users (no passwordHash leaked)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Cookie', adminCookies)
        .expect(200)

      expect(Array.isArray(res.body)).toBe(true)
      for (const user of res.body) {
        expect(user).not.toHaveProperty('passwordHash')
      }
    })
  })

  describe('User provisioning flow', () => {
    it('rejects cookie-auth mutation without CSRF token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Cookie', adminCookies)
        .send({ fullName: 'No CSRF', email: `csrf-${NEW_USER_EMAIL}`, role: 'MEMBER' })
        .expect(403)

      expect(res.body.code).toBe('CSRF_INVALID')
    })

    it('ADMIN creates user → 201 with temporaryPassword', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .send({ fullName: 'E2E Member', email: NEW_USER_EMAIL, role: 'MEMBER' })
        .expect(201)

      expect(res.body.temporaryPassword).toEqual(expect.any(String))
      expect(res.body.mustChangePassword).toBe(true)
      expect(res.body).not.toHaveProperty('passwordHash')
      memberTempPassword = res.body.temporaryPassword
    })

    it('duplicate email → 409', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/users')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .send({ fullName: 'Dup', email: NEW_USER_EMAIL, role: 'MEMBER' })
        .expect(409)
    })

    it('new member can login with temporaryPassword', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', e2eClientIp())
        .send({ email: NEW_USER_EMAIL, password: memberTempPassword })
        .expect(200)

      expect(res.body.user.mustChangePassword).toBe(true)
      const session = sessionFromResponse(res)
      memberCookies = session.cookies
      memberCsrfToken = session.csrfToken
    })

    it('blocks business routes until temporary password is changed', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/member/activities')
        .set('Cookie', memberCookies)
        .expect(403)

      expect(res.body.code).toBe('MUST_CHANGE_PASSWORD')
    })

    it('member changes temporary password and clears must-change flag', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Cookie', memberCookies)
        .set('X-CSRF-Token', memberCsrfToken)
        .send({ currentPassword: memberTempPassword, newPassword: 'member-password-123' })
        .expect(200)

      expect(res.body.user).toMatchObject({
        email: NEW_USER_EMAIL,
        role: 'MEMBER',
        mustChangePassword: false,
      })
      const session = sessionFromResponse(res)
      memberCookies = session.cookies
      memberCsrfToken = session.csrfToken
    })

    it('MEMBER is forbidden from admin route → 403', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/users')
        .set('Cookie', memberCookies)
        .expect(403)
    })

    it('PATCH non-existent user → 404', async () => {
      await request(app.getHttpServer())
        .patch('/api/admin/users/00000000-0000-0000-0000-000000000000')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .send({ status: 'DISABLED' })
        .expect(404)
    })

    it('logout clears auth cookies', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', adminCookies)
        .set('X-CSRF-Token', csrfToken)
        .expect(200)

      const setCookie = res.headers['set-cookie'] as unknown as string[]
      expect(setCookie.some((cookie) => cookie.startsWith('dsvtn_access=;'))).toBe(true)
      expect(setCookie.some((cookie) => cookie.startsWith('dsvtn_refresh=;'))).toBe(true)
      expect(setCookie.some((cookie) => cookie.startsWith('dsvtn_csrf=;'))).toBe(true)
    })
  })
})
