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
  listAll(): Promise<Article[]>
  findAdmin(id: string): Promise<Article | null>
  create(input: ArticleFormInput): Promise<Article>
  update(id: string, input: Partial<ArticleFormInput>): Promise<Article>
  archive(id: string): Promise<Article>
}

export interface ArticleFormInput {
  title: string
  slug?: string
  content: string
  status?: ArticleStatus
}

const mockArticleStore: Article[] = [...mockArticles]

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

  async listAll(): Promise<Article[]> {
    return apiFetch<Article[]>('/admin/articles')
  }

  async findAdmin(id: string): Promise<Article | null> {
    const articles = await this.listAll()
    return articles.find((article) => article.id === id) ?? null
  }

  async create(input: ArticleFormInput): Promise<Article> {
    return apiFetch<Article>('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  async update(id: string, input: Partial<ArticleFormInput>): Promise<Article> {
    return apiFetch<Article>(`/admin/articles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  }

  async archive(id: string): Promise<Article> {
    return apiFetch<Article>(`/admin/articles/${id}`, {
      method: 'DELETE',
    })
  }
}

export class MockArticlesDataSource implements ArticlesDataSource {
  async listPublished(): Promise<Article[]> {
    return Promise.resolve(
      mockArticleStore
        .filter((article) => article.status === 'PUBLISHED')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    )
  }

  async findPublished(identifier: string): Promise<Article | null> {
    const article =
      mockArticleStore.find(
        (item) =>
          item.status === 'PUBLISHED' && (item.id === identifier || item.slug === identifier),
      ) ?? null
    return Promise.resolve(article)
  }

  async listAll(): Promise<Article[]> {
    return Promise.resolve(
      [...mockArticleStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    )
  }

  async findAdmin(id: string): Promise<Article | null> {
    return Promise.resolve(mockArticleStore.find((article) => article.id === id) ?? null)
  }

  async create(input: ArticleFormInput): Promise<Article> {
    const slug = resolveSlug(input.slug, input.title)
    ensureMockSlugAvailable(slug)

    const now = new Date().toISOString()
    const article: Article = {
      id: `mock-article-${Date.now()}`,
      title: input.title,
      slug,
      content: input.content,
      status: input.status ?? 'DRAFT',
      authorId: 'mock-admin',
      createdAt: now,
      updatedAt: now,
    }
    mockArticleStore.unshift(article)
    return Promise.resolve(article)
  }

  async update(id: string, input: Partial<ArticleFormInput>): Promise<Article> {
    const index = mockArticleStore.findIndex((article) => article.id === id)
    if (index < 0) {
      throw new Error('Không tìm thấy bài viết')
    }

    const existing = mockArticleStore[index]
    const nextSlug =
      input.slug !== undefined
        ? resolveSlug(input.slug, input.title ?? existing.title)
        : existing.slug
    ensureMockSlugAvailable(nextSlug, id)

    const updated: Article = {
      ...existing,
      title: input.title ?? existing.title,
      slug: nextSlug,
      content: input.content ?? existing.content,
      status: input.status ?? existing.status,
      updatedAt: new Date().toISOString(),
    }
    mockArticleStore[index] = updated
    return Promise.resolve(updated)
  }

  async archive(id: string): Promise<Article> {
    return this.update(id, { status: 'ARCHIVED' })
  }
}

function resolveSlug(inputSlug: string | undefined, title: string): string {
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

function ensureMockSlugAvailable(slug: string, currentId?: string) {
  const duplicate = mockArticleStore.find(
    (article) => article.slug === slug && article.id !== currentId,
  )
  if (duplicate) {
    throw new Error('Slug đã tồn tại')
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
