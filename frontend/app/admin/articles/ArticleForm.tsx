'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MarkdownView } from '@/components/shared/MarkdownView'
import {
  getArticlesDataSource,
  type Article,
  type ArticleFormInput,
  type ArticleStatus,
} from '@/lib/datasource/articles'

const statuses: { value: ArticleStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PUBLISHED', label: 'Xuất bản' },
  { value: 'ARCHIVED', label: 'Lưu trữ' },
]

interface ArticleFormProps {
  articleId?: string
}

export function ArticleForm({ articleId }: ArticleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(Boolean(articleId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ArticleFormInput>({
    title: '',
    slug: '',
    content: '',
    status: 'DRAFT',
  })

  useEffect(() => {
    if (!articleId) return
    const id = articleId

    async function loadArticle() {
      setLoading(true)
      setError(null)
      try {
        const article = await getArticlesDataSource().findAdmin(id)
        if (!article) {
          setError('Không tìm thấy bài viết')
          return
        }
        setForm(articleToForm(article))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tải bài viết thất bại')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [articleId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const input = {
        ...form,
        slug: form.slug?.trim() || undefined,
        title: form.title.trim(),
        content: form.content.trim(),
      }
      if (!input.title || !input.content) {
        setError('Tiêu đề và nội dung là bắt buộc')
        return
      }

      if (articleId) {
        await getArticlesDataSource().update(articleId, input)
      } else {
        await getArticlesDataSource().create(input)
      }
      router.push('/admin/articles')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu bài viết thất bại')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">Đang tải bài viết...</p>
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="space-y-5 rounded-md border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={form.slug ?? ''}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Tự sinh từ tiêu đề nếu để trống"
            maxLength={220}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <select
            id="status"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({ ...current, status: event.target.value as ArticleStatus }))
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Nội dung markdown *</Label>
          <textarea
            id="content"
            value={form.content}
            onChange={(event) =>
              setForm((current) => ({ ...current, content: event.target.value }))
            }
            className="min-h-80 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            maxLength={50000}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu bài viết'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/articles')}>
            Huỷ
          </Button>
        </div>
      </div>

      <aside className="rounded-md border bg-background p-5">
        <p className="text-sm font-medium text-muted-foreground">Preview</p>
        <h1 className="mt-3 text-2xl font-semibold">{form.title || 'Tiêu đề bài viết'}</h1>
        <div className="mt-4 border-t pt-2">
          <MarkdownView content={form.content || 'Nội dung markdown sẽ hiển thị tại đây.'} />
        </div>
      </aside>
    </form>
  )
}

function articleToForm(article: Article): ArticleFormInput {
  return {
    title: article.title,
    slug: article.slug,
    content: article.content,
    status: article.status,
  }
}
