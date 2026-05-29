import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request = require('supertest')
import { AppModule } from '../src/app.module'
import { AllExceptionsFilter } from '../src/common/filters'
import { PrismaService } from '../src/prisma/prisma.service'

const ADMIN_EMAIL = 'admin@dsvtn.vn'
const ADMIN_PASSWORD = 'changeme'
const SLUG_PREFIX = `e2e-article-${Date.now()}`

describe('Articles (e2e)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let adminToken: string
  let articleId: string
  let articleSlug: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile()
    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalFilters(new AllExceptionsFilter())
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    )
    await app.init()
    prisma = app.get(PrismaService)

    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      .expect(200)
    adminToken = login.body.accessToken
  })

  afterAll(async () => {
    if (prisma) {
      await prisma.article.deleteMany({ where: { slug: { startsWith: SLUG_PREFIX } } })
    }
    if (app) {
      await app.close()
    }
  })

  it('admin creates draft article with auto-generated slug', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: SLUG_PREFIX,
        slug: '',
        content: '## Raw markdown\nNội dung giữ nguyên.',
      })
      .expect(201)

    articleId = res.body.id
    articleSlug = res.body.slug
    expect(articleSlug).toBe(SLUG_PREFIX)
    expect(res.body.status).toBe('DRAFT')
    expect(res.body.content).toContain('## Raw markdown')
  })

  it('duplicate slug returns 409', async () => {
    await request(app.getHttpServer())
      .post('/api/admin/articles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `${SLUG_PREFIX} duplicate`,
        slug: articleSlug,
        content: 'duplicate',
      })
      .expect(409)
  })

  it('public cannot see draft article', async () => {
    const list = await request(app.getHttpServer()).get('/api/public/articles').expect(200)
    expect(list.body.some((article: { id: string }) => article.id === articleId)).toBe(false)

    await request(app.getHttpServer()).get(`/api/public/articles/${articleSlug}`).expect(404)
  })

  it('publish makes article visible by slug', async () => {
    await request(app.getHttpServer())
      .patch(`/api/admin/articles/${articleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PUBLISHED' })
      .expect(200)

    const publicDetail = await request(app.getHttpServer())
      .get(`/api/public/articles/${articleSlug}`)
      .expect(200)
    expect(publicDetail.body.id).toBe(articleId)
  })

  it('archive soft deletes article from public routes', async () => {
    const archived = await request(app.getHttpServer())
      .delete(`/api/admin/articles/${articleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
    expect(archived.body.status).toBe('ARCHIVED')

    const stored = await prisma.article.findUnique({ where: { id: articleId } })
    expect(stored?.status).toBe('ARCHIVED')

    await request(app.getHttpServer()).get(`/api/public/articles/${articleSlug}`).expect(404)
  })
})
