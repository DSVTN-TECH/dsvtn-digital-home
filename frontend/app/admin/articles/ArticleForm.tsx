'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

type Snippet = {
  label: string
  title: string
  apply: (selected: string) => { text: string; cursor: number }
}

const snippets: Snippet[] = [
  {
    label: 'H2',
    title: 'Tiêu đề cấp 2',
    apply: (s) => ({ text: `## ${s || 'Tiêu đề'}`, cursor: 3 }),
  },
  {
    label: 'H3',
    title: 'Tiêu đề cấp 3',
    apply: (s) => ({ text: `### ${s || 'Tiêu đề'}`, cursor: 4 }),
  },
  { label: 'B', title: 'In đậm', apply: (s) => ({ text: `**${s || 'đậm'}**`, cursor: 2 }) },
  { label: 'I', title: 'In nghiêng', apply: (s) => ({ text: `_${s || 'nghiêng'}_`, cursor: 1 }) },
  {
    label: 'Link',
    title: 'Liên kết',
    apply: (s) => ({ text: `[${s || 'nhãn'}](https://)`, cursor: 1 }),
  },
  { label: 'List', title: 'Danh sách', apply: (s) => ({ text: `- ${s || 'mục'}`, cursor: 2 }) },
]

interface ArticleFormProps {
  articleId?: string
}

export function ArticleForm({ articleId }: ArticleFormProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [loading, setLoading] = useState(Boolean(articleId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
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
        setDirty(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tải bài viết thất bại')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [articleId])

  const wordCount = useMemo(
    () => form.content.trim().split(/\s+/).filter(Boolean).length,
    [form.content],
  )

  function updateForm(patch: Partial<ArticleFormInput>) {
    setForm((current) => ({ ...current, ...patch }))
    setDirty(true)
  }

  function insertSnippet(snippet: Snippet) {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = form.content.slice(start, end)
    const { text } = snippet.apply(selected)
    const next = form.content.slice(0, start) + text + form.content.slice(end)
    updateForm({ content: next })
    requestAnimationFrame(() => {
      textarea.focus()
      const caret = start + text.length
      textarea.setSelectionRange(caret, caret)
    })
  }

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
      setDirty(false)
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
            onChange={(event) => updateForm({ title: event.target.value })}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Nội dung markdown *</Label>
          <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Công cụ markdown">
            {snippets.map((snippet) => (
              <Button
                key={snippet.label}
                type="button"
                variant="outline"
                size="sm"
                title={snippet.title}
                aria-label={snippet.title}
                onClick={() => insertSnippet(snippet)}
              >
                {snippet.label}
              </Button>
            ))}
          </div>
          <textarea
            id="content"
            ref={textareaRef}
            value={form.content}
            onChange={(event) => updateForm({ content: event.target.value })}
            className="min-h-80 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            maxLength={50000}
          />
        </div>

        {error && (
          <div
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={saving || !dirty}>
            {saving ? 'Đang lưu...' : 'Lưu bài viết'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/articles')}>
            Huỷ
          </Button>
          {dirty ? (
            <span className="text-xs text-muted-foreground" role="status">
              Có thay đổi chưa lưu
            </span>
          ) : null}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="space-y-4 rounded-md border bg-card p-5">
          <p className="text-sm font-medium">Thông tin bài viết</p>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug ?? ''}
              onChange={(event) => updateForm({ slug: event.target.value })}
              placeholder="Tự sinh từ tiêu đề nếu để trống"
              maxLength={220}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Trạng thái</Label>
            <select
              id="status"
              value={form.status}
              onChange={(event) => updateForm({ status: event.target.value as ArticleStatus })}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">{wordCount} từ</p>
        </div>

        <div className="rounded-md border bg-background p-5">
          <p className="text-sm font-medium text-muted-foreground">Xem trước (đã làm sạch)</p>
          <h1 className="mt-3 text-2xl font-semibold">{form.title || 'Tiêu đề bài viết'}</h1>
          <div className="mt-4 border-t pt-2">
            <MarkdownView content={form.content || 'Nội dung markdown sẽ hiển thị tại đây.'} />
          </div>
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
