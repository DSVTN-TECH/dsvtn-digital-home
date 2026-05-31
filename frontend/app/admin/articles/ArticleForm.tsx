'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Badge } from '@/components/ui/badge'
import { Skeleton, SkeletonText } from '@/components/ui/skeleton'
import { MarkdownView } from '@/components/shared/MarkdownView'
import {
  getArticlesDataSource,
  type Article,
  type ArticleFormInput,
  type ArticleStatus,
} from '@/lib/datasource'

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
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]" role="status" aria-live="polite">
        <Card variant="bento" className="p-5">
          <Skeleton className="h-9 w-2/3" rounded="sm" />
          <Skeleton className="mt-5 h-64 w-full" />
        </Card>
        <Card variant="bento" className="p-5">
          <Skeleton className="h-5 w-1/2" rounded="sm" />
          <SkeletonText className="mt-4" lines={4} />
        </Card>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card variant="bento" className="p-0">
        <CardHeader className="flex-row items-start justify-between gap-4 border-b border-border">
          <div>
            <CardTitle>{articleId ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Sử dụng Markdown an toàn. Preview cập nhật theo thời gian thực.
            </p>
          </div>
          {dirty ? (
            <Badge tone="warning" role="status">
              Có thay đổi chưa lưu
            </Badge>
          ) : (
            <Badge tone="neutral">Đã đồng bộ</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField label="Tiêu đề" htmlFor="title" required>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => updateForm({ title: event.target.value })}
              maxLength={200}
              placeholder="Tiêu đề ngắn gọn, hấp dẫn"
            />
          </FormField>

          <FormField
            label="Nội dung Markdown"
            htmlFor="content"
            required
            help="Hỗ trợ tiêu đề, danh sách, link và in đậm. Tối đa 50.000 ký tự."
          >
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
              className="mt-2 min-h-80 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm font-mono leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              maxLength={50000}
            />
          </FormField>

          {error ? (
            <div
              className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
            <Button type="submit" disabled={saving || !dirty}>
              {saving ? 'Đang lưu...' : 'Lưu bài viết'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/articles')}>
              Huỷ
            </Button>
            <span className="ml-auto text-xs font-semibold text-muted-foreground">
              {wordCount} từ
            </span>
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-5">
        <Card variant="bento" className="p-0">
          <CardHeader>
            <CardTitle className="text-base">Thông tin xuất bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Slug" htmlFor="slug" help="Để trống để tự sinh từ tiêu đề.">
              <Input
                id="slug"
                value={form.slug ?? ''}
                onChange={(event) => updateForm({ slug: event.target.value })}
                placeholder="vd: ngay-hoi-tinh-nguyen-2026"
                maxLength={220}
              />
            </FormField>
            <FormField label="Trạng thái" htmlFor="status">
              <Select
                id="status"
                value={form.status}
                onChange={(event) => updateForm({ status: event.target.value as ArticleStatus })}
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </CardContent>
        </Card>

        <Card variant="bento" className="p-0">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Xem trước</CardTitle>
            <Badge tone="success">Đã làm sạch</Badge>
          </CardHeader>
          <CardContent>
            <h1 className="text-h3">{form.title || 'Tiêu đề bài viết'}</h1>
            <div className="mt-4 border-t border-border pt-4">
              <MarkdownView content={form.content || 'Nội dung markdown sẽ hiển thị tại đây.'} />
            </div>
          </CardContent>
        </Card>
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
