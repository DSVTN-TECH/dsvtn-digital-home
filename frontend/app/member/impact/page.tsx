'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProfileDataSource } from '@/lib/datasource'
import type { MemberImpact } from '@/lib/datasource/profile.datasource'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

export default function MemberImpactPage() {
  const dataSource = getProfileDataSource()
  const [impact, setImpact] = useState<MemberImpact | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setImpact(await dataSource.getImpact())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource])

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || !impact) return <ErrorState onRetry={load} />

  const noImpact =
    impact.completedAssignments === 0 &&
    impact.totalActivities === 0 &&
    impact.totalPoints === 0 &&
    impact.badgeCount === 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card variant="bento" className="bg-primary p-6 text-primary-foreground sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/75">
          Tác động
        </p>
        <h1 className="mt-2 text-h1 text-primary-foreground">Tác động của bạn</h1>
        <p className="mt-2 max-w-2xl text-sm text-primary-foreground/80">
          Tổng hợp đóng góp của bạn cho cộng đồng ĐSVTN.
        </p>
      </Card>

      {noImpact ? (
        <EmptyState
          title="Chưa có đóng góp"
          description="Bạn chưa có đóng góp nào được ghi nhận. Hãy tham gia một hoạt động để bắt đầu!"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Nhiệm vụ hoàn thành"
            value={impact.completedAssignments}
            icon="task_alt"
            tone="success"
          />
          <StatCard
            label="Hoạt động tham gia"
            value={impact.totalActivities}
            icon="event_available"
            tone="primary"
          />
          <StatCard label="Tổng điểm" value={impact.totalPoints} icon="bolt" tone="info" />
          <StatCard
            label="Huy hiệu"
            value={impact.badgeCount}
            icon="military_tech"
            tone="warning"
          />
        </div>
      )}
    </div>
  )
}
