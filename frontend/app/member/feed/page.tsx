'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getFeedDataSource } from '@/lib/datasource'
import type { FeedItem } from '@/lib/datasource'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'

const TYPE_LABEL: Record<FeedItem['type'], string> = {
  notification: 'Thông báo',
  article: 'Bài viết',
  activity: 'Hoạt động',
}

const TYPE_TONE: Record<FeedItem['type'], 'primary' | 'success' | 'info'> = {
  notification: 'info',
  article: 'primary',
  activity: 'success',
}

const TYPE_ICON: Record<FeedItem['type'], string> = {
  notification: 'notifications_active',
  article: 'article',
  activity: 'event',
}

export default function MemberFeedPage() {
  const dataSource = getFeedDataSource()
  const [items, setItems] = useState<FeedItem[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setItems(await dataSource.list())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="svtn-eyebrow">Member Zone</p>
        <h1 className="text-h1">Bảng tin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tổng hợp thông báo, bài viết và hoạt động liên quan đến bạn.
        </p>
      </div>

      {status === 'loading' ? (
        <LoadingSkeleton className="grid-cols-1" />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có gì mới" description="Bảng tin của bạn đang trống." />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="block">
                <Card variant="bento" interactive className="p-4">
                  <div className="flex items-start gap-4">
                    <span
                      className="material-symbols-outlined rounded-2xl bg-[color:var(--primary-soft)] p-3 text-primary"
                      aria-hidden="true"
                    >
                      {TYPE_ICON[item.type]}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={TYPE_TONE[item.type]}>{TYPE_LABEL[item.type]}</Badge>
                        <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </time>
                      </div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      {item.description ? (
                        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
