import { apiFetch } from '@/lib/api'
import type { Article, ArticleFormInput, ArticlesDataSource } from './articles.datasource'

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
    return apiFetch<Article>(`/admin/articles/${id}`, { method: 'DELETE' })
  }
}
