import { Article } from '@prisma/client'
import { BaseRepository } from '../../common/repository'

export type CreateArticleData = {
  title: string
  slug: string
  content: string
  status: Article['status']
  authorId: string
}

export type UpdateArticleData = {
  title?: string
  slug?: string
  content?: string
  status?: Article['status']
}

export abstract class ArticlesRepository extends BaseRepository<
  Article,
  CreateArticleData,
  UpdateArticleData
> {
  abstract findBySlug(slug: string): Promise<Article | null>
  abstract findPublicByIdentifier(identifier: string): Promise<Article | null>
  abstract findPublished(): Promise<Article[]>
  abstract archive(id: string): Promise<Article>
}
