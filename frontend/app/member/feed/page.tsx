'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { getFeedDataSource } from '@/lib/datasource'
import type { FeedItem } from '@/lib/datasource'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

const TYPE_LABEL: Record<FeedItem['type'], string> = {
  notification: 'Thông báo',
  article: 'Bài viết',
  activity: 'Hoạt động',
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bảng tin</h1>
        <p className="text-sm text-muted-foreground">Cập nhật mới nhất dành cho bạn.</p>
      </div>

      {status === 'loading' ? (
        <LoadingState />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có gì mới" description="Bảng tin của bạn đang trống." />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border p-4">
              <Link href={item.href} className="block space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{TYPE_LABEL[item.type]}</Badge>
                  <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </time>
                </div>
                <p className="font-medium">{item.title}</p>
                {item.description ? (
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
