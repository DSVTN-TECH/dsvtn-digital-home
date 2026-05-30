'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProfileDataSource } from '@/lib/datasource'
import type { MemberImpact } from '@/lib/datasource/profile.datasource'
import { ErrorState, LoadingState } from '@/components/shared/PageStates'

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

  const metrics = [
    { label: 'Nhiệm vụ hoàn thành', value: impact.completedAssignments },
    { label: 'Hoạt động tham gia', value: impact.totalActivities },
    { label: 'Tổng điểm đóng góp', value: impact.totalPoints },
    { label: 'Huy hiệu', value: impact.badgeCount },
  ]

  const noImpact = metrics.every((metric) => metric.value === 0)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tác động của bạn</h1>
        <p className="text-sm text-muted-foreground">
          Tổng hợp đóng góp của bạn cho cộng đồng ĐSVTN.
        </p>
      </div>

      {noImpact ? (
        <div
          role="status"
          className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground"
        >
          Bạn chưa có đóng góp nào được ghi nhận. Hãy tham gia một hoạt động để bắt đầu!
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-lg border p-6">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="pt-2 text-3xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
