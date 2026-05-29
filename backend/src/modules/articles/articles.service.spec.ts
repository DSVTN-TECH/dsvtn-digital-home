import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ARTICLES_REPOSITORY } from '../../common/repository'
import { ArticlesRepository } from './articles.repository'
import { ArticlesService } from './articles.service'

const baseArticle = {
  id: 'a-1',
  title: 'Xuân tình nguyện 2026',
  slug: 'xuan-tinh-nguyen-2026',
  content: '## Markdown',
  status: 'DRAFT' as const,
  authorId: 'u-1',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

describe('ArticlesService', () => {
  let service: ArticlesService
  let repo: jest.Mocked<
    Pick<
      ArticlesRepository,
      | 'findById'
      | 'findBySlug'
      | 'findMany'
      | 'findPublished'
      | 'findPublicByIdentifier'
      | 'create'
      | 'update'
      | 'archive'
    >
  >

  beforeEach(async () => {
    repo = {
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findMany: jest.fn(),
      findPublished: jest.fn(),
      findPublicByIdentifier: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [ArticlesService, { provide: ARTICLES_REPOSITORY, useValue: repo }],
    }).compile()

    service = module.get(ArticlesService)
  })

  it('listPublished: returns published articles only from repository', async () => {
    repo.findPublished.mockResolvedValue([{ ...baseArticle, status: 'PUBLISHED' }])

    const result = await service.listPublished()

    expect(result).toHaveLength(1)
    expect(repo.findPublished).toHaveBeenCalled()
  })

  it('create: auto-generates slug from Vietnamese title when slug is empty', async () => {
    repo.findBySlug.mockResolvedValue(null)
    repo.create.mockResolvedValue(baseArticle)

    await service.create(
      { title: 'Xuân tình nguyện 2026', slug: '', content: 'raw markdown' },
      'u-1',
    )

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'xuan-tinh-nguyen-2026', status: 'DRAFT' }),
    )
  })

  it('create: throws ConflictException for duplicate slug', async () => {
    repo.findBySlug.mockResolvedValue(baseArticle)

    await expect(
      service.create({ title: 'A', slug: 'xuan-tinh-nguyen-2026', content: 'raw' }, 'u-1'),
    ).rejects.toBeInstanceOf(ConflictException)
  })

  it('findOnePublic: throws NotFoundException when repository returns null', async () => {
    repo.findPublicByIdentifier.mockResolvedValue(null)

    await expect(service.findOnePublic('draft-slug')).rejects.toBeInstanceOf(NotFoundException)
  })

  it('update: changes slug when explicit slug is empty', async () => {
    repo.findById.mockResolvedValue(baseArticle)
    repo.findBySlug.mockResolvedValue(null)
    repo.update.mockResolvedValue({ ...baseArticle, slug: 'tieu-de-moi' })

    await service.update('a-1', { title: 'Tiêu đề mới', slug: '' })

    expect(repo.update).toHaveBeenCalledWith('a-1', {
      title: 'Tiêu đề mới',
      slug: 'tieu-de-moi',
    })
  })

  it('archive: soft deletes by setting ARCHIVED through repository', async () => {
    repo.findById.mockResolvedValue(baseArticle)
    repo.archive.mockResolvedValue({ ...baseArticle, status: 'ARCHIVED' })

    const result = await service.archive('a-1')

    expect(result.status).toBe('ARCHIVED')
    expect(repo.archive).toHaveBeenCalledWith('a-1')
  })
})
