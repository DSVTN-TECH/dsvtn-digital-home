import { mockArticles } from '@/lib/mock/articles'
import type { Article, ArticleFormInput, ArticlesDataSource } from './articles.datasource'
import { resolveSlug } from './articles.datasource'

const mockArticleStore: Article[] = [...mockArticles]

function ensureMockSlugAvailable(slug: string, currentId?: string): void {
  const duplicate = mockArticleStore.find(
    (article) => article.slug === slug && article.id !== currentId,
  )
  if (duplicate) {
    throw new Error('Slug đã tồn tại')
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
    if (index < 0) throw new Error('Không tìm thấy bài viết')
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
