import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { Article } from '@prisma/client'
import { ARTICLES_REPOSITORY } from '../../common/repository'
import { ArticlesRepository } from './articles.repository'
import { CreateArticleDto } from './dto/create-article.dto'
import { UpdateArticleDto } from './dto/update-article.dto'

@Injectable()
export class ArticlesService {
  constructor(@Inject(ARTICLES_REPOSITORY) private readonly articles: ArticlesRepository) {}

  listPublished() {
    return this.articles.findPublished()
  }

  listAll() {
    return this.articles.findMany()
  }

  async findOnePublic(identifier: string) {
    const article = await this.articles.findPublicByIdentifier(identifier)
    if (!article) {
      throw new NotFoundException('Article not found')
    }
    return article
  }

  async create(dto: CreateArticleDto, authorId: string) {
    const slug = this.resolveSlug(dto.slug, dto.title)
    await this.ensureSlugAvailable(slug)

    return this.articles.create({
      title: dto.title,
      slug,
      content: dto.content,
      status: dto.status ?? 'DRAFT',
      authorId,
    })
  }

  async update(id: string, dto: UpdateArticleDto) {
    const existing = await this.articles.findById(id)
    if (!existing) {
      throw new NotFoundException('Article not found')
    }

    const data: Partial<Article> = {}
    if (dto.title !== undefined) data.title = dto.title
    if (dto.content !== undefined) data.content = dto.content
    if (dto.status !== undefined) data.status = dto.status
    if (dto.slug !== undefined) {
      data.slug = this.resolveSlug(dto.slug, dto.title ?? existing.title)
      await this.ensureSlugAvailable(data.slug, id)
    }

    return this.articles.update(id, data)
  }

  async archive(id: string) {
    const existing = await this.articles.findById(id)
    if (!existing) {
      throw new NotFoundException('Article not found')
    }
    return this.articles.archive(id)
  }

  private resolveSlug(inputSlug: string | undefined, title: string): string {
    const raw = inputSlug?.trim() || title
    const slug = raw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return slug || 'article'
  }

  private async ensureSlugAvailable(slug: string, currentId?: string) {
    const existing = await this.articles.findBySlug(slug)
    if (existing && existing.id !== currentId) {
      throw new ConflictException('Article slug already exists')
    }
  }
}
