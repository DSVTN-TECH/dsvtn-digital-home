'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getNotificationsDataSource } from '@/lib/datasource'
import type { NotificationItem } from '@/lib/datasource'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'unread'

const PAGE_SIZE = 20

export default function NotificationsPage() {
  const dataSource = getNotificationsDataSource()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<Filter>('all')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [markingAll, setMarkingAll] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await dataSource.list(1, PAGE_SIZE, filter === 'unread')
      setItems(result.items)
      setUnreadCount(result.unreadCount)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource, filter])

  useEffect(() => {
    void load()
  }, [load])

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Thông báo</h1>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {unreadCount} thông báo chưa đọc
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAll}
          disabled={markingAll || unreadCount === 0}
        >
          {markingAll ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
        </Button>
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Bộ lọc thông báo">
        {(['all', 'unread'] as const).map((value) => (
          <Button
            key={value}
            role="tab"
            aria-selected={filter === value}
            variant={filter === value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(value)}
          >
            {value === 'all' ? 'Tất cả' : 'Chưa đọc'}
          </Button>
        ))}
      </div>

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
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                'rounded-lg border p-4 transition-colors',
                !item.isRead && 'border-primary/40 bg-accent/40',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">{item.title}</p>
                  {item.body ? <p className="text-sm text-muted-foreground">{item.body}</p> : null}
                  <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </time>
                    {item.linkUrl ? (
                      <Link href={item.linkUrl} className="text-primary underline">
                        Xem chi tiết
                      </Link>
                    ) : null}
                  </div>
                </div>
                {!item.isRead ? (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkRead(item.id)}>
                    Đã đọc
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
