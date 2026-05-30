import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { csrfMiddleware } from '../src/common/security/csrf.middleware'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthSession, loginSession, withAuth } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const INVITE_EMAIL = `invite-${Date.now()}@dsvtn.vn`

describe('Invites (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let admin: AuthSession
  let inviteId: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.use(csrfMiddleware)
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()
    prisma = app.get(PrismaService)
    admin = await loginSession(app, ADMIN_EMAIL, ADMIN_PASSWORD)
  })

  afterAll(async () => {
    await prisma.invite.deleteMany({ where: { email: INVITE_EMAIL } })
    await prisma.user.deleteMany({ where: { email: INVITE_EMAIL } })
    await app.close()
  })

  it('rejects invite creation without CSRF', async () => {
    await withAuth(request(app.getHttpServer()).post('/api/admin/invites'), admin)
      .send({ email: INVITE_EMAIL, role: 'MEMBER' })
      .expect(403)
  })

  it('creates invite returning one-time token, lists it, and accepts it', async () => {
    const created = await withAuth(
      request(app.getHttpServer()).post('/api/admin/invites'),
      admin,
      true,
    )
      .send({ email: INVITE_EMAIL, role: 'MEMBER' })
      .expect(201)
    expect(created.body.token).toEqual(expect.any(String))
    expect(created.body).not.toHaveProperty('tokenHash')
    inviteId = created.body.id
    const token = created.body.token

    const list = await withAuth(request(app.getHttpServer()).get('/api/admin/invites'), admin).expect(200)
    expect(list.body.items.some((i: { id: string }) => i.id === inviteId)).toBe(true)

    const accepted = await request(app.getHttpServer())
      .post(`/api/public/invites/${token}/accept`)
      .set('X-Forwarded-For', '198.51.220.10')
      .send({ fullName: 'Invited Member', password: 'invited-password-123' })
      .expect(201)
    expect(accepted.body.user.email).toBe(INVITE_EMAIL)
    expect(accepted.body.user).not.toHaveProperty('passwordHash')

    await request(app.getHttpServer())
      .post(`/api/public/invites/${token}/accept`)
      .set('X-Forwarded-For', '198.51.220.11')
      .send({ fullName: 'Invited Member', password: 'invited-password-123' })
      .expect(409)
  })

  it('rejects expired invite acceptance', async () => {
    const token = `expired-${Date.now()}`
    const { createHash } = await import('crypto')
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const adminUser = await prisma.user.findFirst({ where: { email: ADMIN_EMAIL } })
    const expired = await prisma.invite.create({
      data: {
        email: `expired-${Date.now()}@dsvtn.vn`,
        role: 'MEMBER',
        tokenHash,
        invitedById: adminUser!.id,
        expiresAt: new Date(Date.now() - 1000),
      },
    })

    await request(app.getHttpServer())
      .post(`/api/public/invites/${token}/accept`)
      .set('X-Forwarded-For', '198.51.220.12')
      .send({ fullName: 'Late User', password: 'late-password-123' })
      .expect(422)

    await prisma.invite.deleteMany({ where: { id: expired.id } })
  })

  it('revokes a pending invite', async () => {
    const created = await withAuth(
      request(app.getHttpServer()).post('/api/admin/invites'),
      admin,
      true,
    )
      .send({ email: `revoke-${Date.now()}@dsvtn.vn`, role: 'MEMBER' })
      .expect(201)

    const revoked = await withAuth(
      request(app.getHttpServer()).patch(`/api/admin/invites/${created.body.id}/revoke`),
      admin,
      true,
    ).expect(200)
    expect(revoked.body.status).toBe('REVOKED')

    await prisma.invite.deleteMany({ where: { id: created.body.id } })
  })
})
