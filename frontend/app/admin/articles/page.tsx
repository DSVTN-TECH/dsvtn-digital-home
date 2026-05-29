'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getArticlesDataSource, type Article, type ArticleStatus } from '@/lib/datasource/articles'

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: 'Bản nháp',
  PUBLISHED: 'Xuất bản',
  ARCHIVED: 'Lưu trữ',
}

function badgeVariant(status: ArticleStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'PUBLISHED') return 'default'
  if (status === 'ARCHIVED') return 'destructive'
  return 'secondary'
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function refetch() {
    setLoading(true)
    setError(null)
    try {
      setArticles(await getArticlesDataSource().listAll())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải danh sách bài viết thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  async function handlePublish(article: Article) {
    setBusyId(article.id)
    setError(null)
    try {
      const updated = await getArticlesDataSource().update(article.id, { status: 'PUBLISHED' })
      setArticles((current) => current.map((item) => (item.id === article.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xuất bản thất bại')
    } finally {
      setBusyId(null)
    }
  }

  async function handleArchive(article: Article) {
    setBusyId(article.id)
    setError(null)
    try {
      const updated = await getArticlesDataSource().archive(article.id)
      setArticles((current) => current.map((item) => (item.id === article.id ? updated : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu trữ thất bại')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tin tức CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý bài viết markdown cho trang tin công khai.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">Tạo bài viết</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Đang tải bài viết...</p>
      ) : articles.length === 0 ? (
        <p className="text-muted-foreground">Chưa có bài viết nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
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
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="max-w-md font-medium">{article.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{article.slug}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(article.status)}>
                      {statusLabels[article.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(article.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/articles/${article.id}`}>Sửa</Link>
                      </Button>
                      {article.status !== 'PUBLISHED' && (
                        <Button
                          size="sm"
                          disabled={busyId === article.id}
                          onClick={() => handlePublish(article)}
                        >
                          Xuất bản
                        </Button>
                      )}
                      {article.status !== 'ARCHIVED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busyId === article.id}
                          onClick={() => handleArchive(article)}
                        >
                          Lưu trữ
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
