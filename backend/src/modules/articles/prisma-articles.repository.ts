import { Injectable } from '@nestjs/common'
import { Article } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { ArticlesRepository, CreateArticleData, UpdateArticleData } from './articles.repository'

@Injectable()
export class PrismaArticlesRepository extends ArticlesRepository {
  constructor(private readonly prisma: PrismaService) {
    super()
  }

  async findById(id: string): Promise<Article | null> {
    return this.prisma.article.findUnique({ where: { id } })
  }

  async findBySlug(slug: string): Promise<Article | null> {
    return this.prisma.article.findUnique({ where: { slug } })
  }

  async findMany(filter?: Partial<Article>): Promise<Article[]> {
    return this.prisma.article.findMany({ where: filter, orderBy: { createdAt: 'desc' } })
  }

  async findPublished(): Promise<Article[]> {
    return this.prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPublicByIdentifier(identifier: string): Promise<Article | null> {
    return this.prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        OR: [{ id: identifier }, { slug: identifier }],
      },
    })
  }

  async create(data: CreateArticleData): Promise<Article> {
    return this.prisma.article.create({ data })
  }

  async update(id: string, data: UpdateArticleData): Promise<Article> {
    return this.prisma.article.update({ where: { id }, data })
  }

  async archive(id: string): Promise<Article> {
    return this.prisma.article.update({ where: { id }, data: { status: 'ARCHIVED' } })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.article.delete({ where: { id } })
  }
}
