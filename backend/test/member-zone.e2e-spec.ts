import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { csrfMiddleware } from '../src/common/security/csrf.middleware'
import { PrismaService } from '../src/prisma/prisma.service'
import { e2eClientIp, sessionFromResponse, withAuth, type AuthSession } from './auth-e2e-helpers'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const BADGE_CODE = `E2E_${Date.now()}`

describe('Member Zone (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let admin: AuthSession

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.use(csrfMiddleware)
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    )
    await app.init()
    prisma = app.get(PrismaService)

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-Forwarded-For', e2eClientIp())
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200)
    admin = sessionFromResponse(login)
  })

  afterAll(async () => {
    await prisma.userBadge.deleteMany({ where: { badge: { code: BADGE_CODE } } })
    await prisma.badge.deleteMany({ where: { code: BADGE_CODE } })
    await prisma.galleryPhoto.deleteMany({ where: { caption: 'e2e-photo' } })
    await prisma.galleryAlbum.deleteMany({ where: { title: 'e2e-album' } })
    await app.close()
  })

  describe('Notifications', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer()).get('/api/member/notifications').expect(401)
    })

    it('returns paginated own notifications with unread count', async () => {
      const res = await withAuth(request(app.getHttpServer()).get('/api/member/notifications'), admin)
        .expect(200)
      expect(res.body).toMatchObject({
        items: expect.any(Array),
        total: expect.any(Number),
        unreadCount: expect.any(Number),
      })
    })

    it('marks all read', async () => {
      const res = await withAuth(
        request(app.getHttpServer()).post('/api/member/notifications/read-all'),
        admin,
        true,
      ).expect(201)
      expect(res.body).toHaveProperty('updated')
    })
  })

  describe('Badges', () => {
    it('rejects badge creation without CSRF', async () => {
      await withAuth(request(app.getHttpServer()).post('/api/admin/badges'), admin)
        .send({ code: BADGE_CODE, name: 'E2E', criteriaType: 'POINTS_TOTAL', criteriaThreshold: 100 })
        .expect(403)
    })

    it('creates a badge definition and lists it', async () => {
      await withAuth(request(app.getHttpServer()).post('/api/admin/badges'), admin, true)
        .send({ code: BADGE_CODE, name: 'E2E', criteriaType: 'POINTS_TOTAL', criteriaThreshold: 100 })
        .expect(201)

      const list = await withAuth(request(app.getHttpServer()).get('/api/admin/badges'), admin).expect(200)
      expect(list.body.some((b: { code: string }) => b.code === BADGE_CODE)).toBe(true)
    })
  })

  describe('Profile + gamification', () => {
    it('returns own profile aggregate', async () => {
      const res = await withAuth(request(app.getHttpServer()).get('/api/member/profile'), admin).expect(200)
      expect(res.body.profile).toMatchObject({ email: ADMIN_EMAIL })
      expect(res.body.profile).not.toHaveProperty('passwordHash')
      expect(res.body).toHaveProperty('badges')
      expect(res.body).toHaveProperty('history')
    })

    it('returns own streak and leaderboard', async () => {
      await withAuth(request(app.getHttpServer()).get('/api/member/streak'), admin).expect(200)
      const leaderboard = await withAuth(
        request(app.getHttpServer()).get('/api/member/leaderboard?month=2026-05'),
        admin,
      ).expect(200)
      expect(leaderboard.body).toMatchObject({ month: '2026-05', rows: expect.any(Array) })
    })
  })

  describe('Gallery', () => {
    let albumId: string

    it('lists public albums without auth', async () => {
      await request(app.getHttpServer()).get('/api/public/gallery').expect(200)
    })

    it('rejects non-HTTPS cover URL with 400', async () => {
      await withAuth(request(app.getHttpServer()).post('/api/admin/gallery'), admin, true)
        .send({ title: 'e2e-album', coverImageUrl: 'http://insecure/x.jpg' })
        .expect(400)
    })

    it('creates album and adds a photo (admin)', async () => {
      const created = await withAuth(request(app.getHttpServer()).post('/api/admin/gallery'), admin, true)
        .send({ title: 'e2e-album' })
        .expect(201)
      albumId = created.body.id

      await withAuth(
        request(app.getHttpServer()).post(`/api/admin/gallery/${albumId}/photos`),
        admin,
        true,
      )
        .send({ imageUrl: 'https://example.com/p.jpg', caption: 'e2e-photo' })
        .expect(201)

      const detail = await request(app.getHttpServer())
        .get(`/api/public/gallery/${albumId}`)
        .expect(200)
      expect(detail.body.photos).toHaveLength(1)
    })
  })
})
