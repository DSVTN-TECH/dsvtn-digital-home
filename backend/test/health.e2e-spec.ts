import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { csrfMiddleware } from '../src/common/security/csrf.middleware'

describe('Health (e2e)', () => {
  let app: INestApplication

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
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /api/health returns status and redis dependency', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200)

    expect(res.body).toMatchObject({
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      dependencies: {
        redis: expect.stringMatching(/^(up|down)$/),
      },
    })
    expect(['ok', 'degraded']).toContain(res.body.status)
  })
})
