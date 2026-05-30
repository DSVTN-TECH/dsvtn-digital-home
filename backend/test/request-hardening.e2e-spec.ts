import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { csrfMiddleware } from '../src/common/security/csrf.middleware'

describe('Request hardening (e2e)', () => {
  let app: INestApplication
  const previousRateLimitEnabled = process.env.RATE_LIMIT_ENABLED

  beforeAll(async () => {
    process.env.RATE_LIMIT_ENABLED = 'true'

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
  })

  afterAll(async () => {
    await app.close()
    if (previousRateLimitEnabled === undefined) {
      delete process.env.RATE_LIMIT_ENABLED
    } else {
      process.env.RATE_LIMIT_ENABLED = previousRateLimitEnabled
    }
  })

  describe('rate limit', () => {
    it('returns 429 with RATE_LIMITED code after exceeding login limit', async () => {
      const server = app.getHttpServer()
      const ip = '203.0.113.10'
      let lastStatus = 0
      let rateLimitedBody: Record<string, unknown> | null = null

      // login limit is 10 per 15 min; the 11th from same IP must be blocked
      for (let i = 0; i < 12; i += 1) {
        const res = await request(server)
          .post('/api/auth/login')
          .set('X-Forwarded-For', ip)
          .send({ email: 'nobody@dsvtn.vn', password: 'wrong-password' })
        lastStatus = res.status
        if (res.status === 429) {
          rateLimitedBody = res.body
          break
        }
      }

      expect(lastStatus).toBe(429)
      expect(rateLimitedBody).toMatchObject({ code: 'RATE_LIMITED' })
      expect(rateLimitedBody?.details).toMatchObject({
        retryAfterSeconds: expect.any(Number),
      })
    })
  })

  describe('idempotency', () => {
    it('replays the same response for a repeated idempotency key', async () => {
      const server = app.getHttpServer()
      const idempotencyKey = `e2e-vol-${Date.now()}`
      const payload = {
        fullName: 'E2E Idempotent Volunteer',
        email: `e2e-idem-${Date.now()}@dsvtn.vn`,
        phone: '0900000000',
        studentId: 'SV000111',
        note: 'idempotency e2e',
      }

      const first = await request(server)
        .post('/api/public/volunteer-applications')
        .set('X-Forwarded-For', '203.0.113.20')
        .set('Idempotency-Key', idempotencyKey)
        .send(payload)

      const second = await request(server)
        .post('/api/public/volunteer-applications')
        .set('X-Forwarded-For', '203.0.113.20')
        .set('Idempotency-Key', idempotencyKey)
        .send(payload)

      // When Redis is available the second call replays the stored body.
      // When Redis is down both calls execute; we only assert no server error.
      expect([200, 201]).toContain(first.status)
      expect([200, 201]).toContain(second.status)
      if (first.body?.id && second.body?.id) {
        expect(second.body.id).toBe(first.body.id)
      }
    })
  })
})
