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

export interface ArticleFormInput {
  title: string
  slug?: string
  content: string
  status?: ArticleStatus
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

export function resolveSlug(inputSlug: string | undefined, title: string): string {
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
