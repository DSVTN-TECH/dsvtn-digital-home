'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getMemberActivitiesDataSource } from '@/lib/datasource'
import type { Activity } from '@/types/api'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'

const activityStatusLabels: Record<Activity['status'], string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  MATCHED: 'Đã phân công',
  COMPLETED: 'Hoàn thành',
}

function statusTone(status: Activity['status']): 'primary' | 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'OPEN':
      return 'success'
    case 'MATCHED':
      return 'primary'
    case 'CLOSED':
      return 'warning'
    default:
      return 'neutral'
  }
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function MemberActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  function load() {
    setStatus('loading')
    getMemberActivitiesDataSource()
      .listOpen()
      .then((items) => {
        setActivities(items)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Member Zone</p>
          <h1 className="text-h1">Hoạt động đang mở</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đăng ký và chấm điểm ưu tiên cho các nhiệm vụ phù hợp.
          </p>
        </div>
      </div>

      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : activities.length === 0 ? (
        <EmptyState
          title="Chưa có hoạt động"
          description="Hiện chưa có hoạt động nào đang mở đăng ký."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activities.map((a) => (
            <li key={a.id}>
              <Card variant="bento" interactive className="flex h-full flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-base font-bold text-foreground">{a.title}</h2>
                  <Badge tone={statusTone(a.status)}>{activityStatusLabels[a.status]}</Badge>
                </div>
                {a.description ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {a.description}
                  </p>
                ) : null}
                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <dt className="font-semibold uppercase tracking-wide">Bắt đầu</dt>
                    <dd className="mt-1 text-foreground">{formatDateTime(a.startTime)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold uppercase tracking-wide">Kết thúc</dt>
                    <dd className="mt-1 text-foreground">{formatDateTime(a.endTime)}</dd>
                  </div>
                </dl>
                <div className="mt-auto pt-4">
                  <Button asChild variant="subtle" size="sm" className="w-full">
                    <Link href={`/member/activities/${a.id}`}>
                      Xem &amp; đăng ký <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
