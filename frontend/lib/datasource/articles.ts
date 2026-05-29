import { apiFetch } from '@/lib/api'
import { mockArticles } from '@/lib/mock/articles'

export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  status: ArticleStatus
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface ArticlesDataSource {
  listPublished(): Promise<Article[]>
  findPublished(identifier: string): Promise<Article | null>
}

export class ApiArticlesDataSource implements ArticlesDataSource {
  async listPublished(): Promise<Article[]> {
    return apiFetch<Article[]>('/public/articles')
  }

  async findPublished(identifier: string): Promise<Article | null> {
    try {
      return await apiFetch<Article>(`/public/articles/${encodeURIComponent(identifier)}`)
    } catch {
      return null
    }
  }
}

export class MockArticlesDataSource implements ArticlesDataSource {
  async listPublished(): Promise<Article[]> {
    return Promise.resolve(
      mockArticles
        .filter((article) => article.status === 'PUBLISHED')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    )
  }

  async findPublished(identifier: string): Promise<Article | null> {
    const article =
      mockArticles.find(
        (item) =>
          item.status === 'PUBLISHED' && (item.id === identifier || item.slug === identifier),
      ) ?? null
    return Promise.resolve(article)
  }
}

type DataSourceMode = 'mock' | 'api'

let articlesDataSource: ArticlesDataSource | null = null

export function getArticlesDataSource(): ArticlesDataSource {
  if (!articlesDataSource) {
    const mode: DataSourceMode = (process.env.NEXT_PUBLIC_DATA_SOURCE as DataSourceMode) ?? 'mock'
    articlesDataSource = mode === 'api' ? new ApiArticlesDataSource() : new MockArticlesDataSource()
  }
  return articlesDataSource
}
