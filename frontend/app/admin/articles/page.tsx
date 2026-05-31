'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getArticlesDataSource, type Article, type ArticleStatus } from '@/lib/datasource'

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Xuất bản',
  ARCHIVED: 'Lưu trữ',
}

const statusTone: Record<ArticleStatus, 'success' | 'warning' | 'neutral'> = {
  DRAFT: 'warning',
  PUBLISHED: 'success',
  ARCHIVED: 'neutral',
}

type FilterValue = 'ALL' | ArticleStatus

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filter, setFilter] = useState<FilterValue>('ALL')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function refetch() {
    setStatus('loading')
    setError(null)
    try {
      setArticles(await getArticlesDataSource().listAll())
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải danh sách bài viết thất bại')
      setStatus('error')
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  async function handlePublish(article: Article) {
    setBusyId(article.id)
    try {
      const updated = await getArticlesDataSource().update(article.id, { status: 'PUBLISHED' })
      setArticles((cur) => cur.map((item) => (item.id === article.id ? updated : item)))
    } finally {
      setBusyId(null)
    }
  }

  async function handleArchive(article: Article) {
    if (!confirm('Lưu trữ bài viết này?')) return
    setBusyId(article.id)
    try {
      const updated = await getArticlesDataSource().archive(article.id)
      setArticles((cur) => cur.map((item) => (item.id === article.id ? updated : item)))
    } finally {
      setBusyId(null)
    }
  }

  const counts = useMemo(() => {
    return {
      ALL: articles.length,
      DRAFT: articles.filter((a) => a.status === 'DRAFT').length,
      PUBLISHED: articles.filter((a) => a.status === 'PUBLISHED').length,
      ARCHIVED: articles.filter((a) => a.status === 'ARCHIVED').length,
    }
  }, [articles])

  const normalizedSearch = search.trim().toLowerCase()
  const byStatus = filter === 'ALL' ? articles : articles.filter((a) => a.status === filter)
  const visible = normalizedSearch
    ? byStatus.filter((article) =>
        [article.title, article.slug, article.content].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      )
    : byStatus

  return (
    <div className="space-y-6">
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Tin tức (CMS)</p>
          <h1 className="text-h1">Quản lý tin tức</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý bài viết markdown cho trang tin công khai.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">
            <Plus className="h-4 w-4" /> Tạo bài viết
          </Link>
        </Button>
      </div>

      <Tabs
        ariaLabel="Lọc bài viết theo trạng thái"
        variant="segment"
        value={filter}
        onChange={(v) => setFilter(v as FilterValue)}
        items={[
          { value: 'ALL', label: 'Tất cả', count: counts.ALL },
          { value: 'DRAFT', label: 'Bản nháp', count: counts.DRAFT },
          { value: 'PUBLISHED', label: 'Xuất bản', count: counts.PUBLISHED },
          { value: 'ARCHIVED', label: 'Lưu trữ', count: counts.ARCHIVED },
        ]}
      />

      <label className="relative block max-w-md" htmlFor="article-search">
        <span className="sr-only">Tìm kiếm bài viết</span>
        <span
          aria-hidden="true"
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          search
        </span>
        <Input
          id="article-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tiêu đề, slug hoặc nội dung"
          className="pl-10"
        />
      </label>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {status === 'loading' ? (
        <LoadingState title="Đang tải bài viết..." />
      ) : status === 'error' ? (
        <ErrorState onRetry={refetch} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="Chưa có bài viết"
          description="Không có bài viết nào ở trạng thái này."
        />
      ) : (
        <Card variant="bento" className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Danh sách bài viết CMS.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="max-w-md font-semibold text-foreground">
                      {article.title}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{article.slug}</TableCell>
                    <TableCell>
                      <Badge tone={statusTone[article.status]}>
                        {statusLabels[article.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(article.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/articles/${article.id}`}>Sửa</Link>
                        </Button>
                        {article.status !== 'PUBLISHED' ? (
                          <Button
                            size="sm"
                            variant="success"
                            disabled={busyId === article.id}
                            onClick={() => handlePublish(article)}
                          >
                            Xuất bản
                          </Button>
                        ) : null}
                        {article.status !== 'ARCHIVED' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === article.id}
                            onClick={() => handleArchive(article)}
                          >
                            Lưu trữ
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
