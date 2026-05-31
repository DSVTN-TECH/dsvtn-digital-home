'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getNotificationsDataSource } from '@/lib/datasource'
import type { NotificationItem } from '@/lib/datasource'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'unread'
const PAGE_SIZE = 20

const ICON_BY_TYPE: Record<string, string> = {
  matcher_run: 'assignment_turned_in',
  badge_unlocked: 'military_tech',
  article_published: 'newspaper',
  order: 'shopping_cart',
  reminder: 'warning',
  system: 'build',
}

function iconForType(type: string): string {
  return ICON_BY_TYPE[type] ?? 'notifications'
}

function relativeTime(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime()
  const mins = Math.round(diffMs / 60000)
  if (mins < 1) return 'Vừa xong'
  if (mins < 60) return `${mins} phút trước`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} giờ trước`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} ngày trước`
  return new Date(value).toLocaleDateString('vi-VN')
}

export default function NotificationsPage() {
  const dataSource = getNotificationsDataSource()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<Filter>('all')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [markingAll, setMarkingAll] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await dataSource.list(page, PAGE_SIZE, filter === 'unread')
      setItems(result.items)
      setUnreadCount(result.unreadCount)
      setTotal(result.total)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource, filter, page])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setPage(1)
  }, [filter])

  async function handleMarkRead(id: string) {
    try {
      await dataSource.markRead(id)
      await load()
    } catch (error) {
      if (error instanceof ApiError) await load()
    }
  }

  async function handleMarkAll() {
    setMarkingAll(true)
    try {
      await dataSource.markAllRead()
      await load()
    } finally {
      setMarkingAll(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card variant="bento" className="bg-primary p-6 text-primary-foreground">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/75">
          Member Zone
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h1 text-primary-foreground">Thông báo</h1>
            <p className="mt-2 text-sm text-primary-foreground/80" aria-live="polite">
              {unreadCount} thông báo chưa đọc
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAll}
            disabled={markingAll || unreadCount === 0}
          >
            {markingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
          </Button>
        </div>
      </Card>

      <Tabs
        ariaLabel="Bộ lọc thông báo"
        variant="pill"
        value={filter}
        onChange={(value) => setFilter(value as Filter)}
        items={[
          { value: 'all', label: 'Tất cả', count: items.length },
          { value: 'unread', label: 'Chưa đọc', count: unreadCount },
        ]}
      />

      {status === 'loading' ? (
        <LoadingState />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Không có thông báo"
          description={filter === 'unread' ? 'Bạn đã đọc hết thông báo.' : 'Chưa có thông báo nào.'}
        />
      ) : (
        <Card variant="bento" className="p-0">
          <ul className="divide-y divide-border" role="list">
            {items.map((item) => (
              <li key={item.id}>
                <article
                  className={cn(
                    'relative flex items-start gap-4 px-5 py-5 transition-colors hover:bg-muted/40',
                    !item.isRead && 'bg-[color:var(--primary-soft)]/50',
                  )}
                >
                  {!item.isRead ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                    />
                  ) : null}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'material-symbols-outlined flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                      item.isRead
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-[color:var(--primary-soft)] text-primary',
                    )}
                  >
                    {iconForType(item.type)}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={cn(
                          'truncate text-sm font-semibold text-foreground',
                          !item.isRead && 'text-primary',
                        )}
                      >
                        {item.title}
                      </p>
                      <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
                        {relativeTime(item.createdAt)}
                      </span>
                    </div>
                    {item.body ? (
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {item.body}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      {item.linkUrl ? (
                        <Link
                          href={item.linkUrl}
                          className="font-semibold text-primary hover:underline"
                          onClick={() => !item.isRead && handleMarkRead(item.id)}
                        >
                          Xem chi tiết
                        </Link>
                      ) : null}
                      {!item.isRead ? <Badge tone="primary">Mới</Badge> : null}
                      {!item.isRead ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => handleMarkRead(item.id)}
                        >
                          Đã đọc
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-border px-5 py-4 text-sm text-muted-foreground">
            <span aria-live="polite">
              Trang {page}/{totalPages}
            </span>
            <Pagination
              page={page}
              pageCount={totalPages}
              onPageChange={setPage}
              ariaLabel="Phân trang thông báo"
            />
          </div>
        </Card>
      )}
    </div>
  )
}
