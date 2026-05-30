'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProfileDataSource } from '@/lib/datasource'
import type { MemberProfileResponse } from '@/lib/datasource/profile.datasource'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

export default function MemberProfilePage() {
  const dataSource = getProfileDataSource()
  const [data, setData] = useState<MemberProfileResponse | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setData(await dataSource.getProfile())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource])

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || !data) return <ErrorState onRetry={load} />

  const { profile, history, badges } = data

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="flex flex-wrap items-center gap-4 rounded-lg border p-6">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-semibold text-primary"
          aria-hidden="true"
        >
          {profile.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{profile.fullName}</h1>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          <p className="text-xs text-muted-foreground">
            Tham gia từ {new Date(profile.joinedAt).toLocaleDateString('vi-VN')}
          </p>
        </div>
      </header>

      <section className="space-y-3" aria-labelledby="badges-heading">
        <h2 id="badges-heading" className="text-lg font-semibold">
          Huy hiệu
        </h2>
        {badges.length === 0 ? (
          <EmptyState
            title="Chưa có huy hiệu"
            description="Hoàn thành nhiệm vụ để mở khoá huy hiệu."
          />
        ) : (
          <ul className="flex flex-wrap gap-3">
            {badges.map((earned) => (
              <li
                key={earned.id}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                title={earned.badge.description ?? undefined}
              >
                <span className="font-medium">{earned.badge.name}</span>
                <Badge variant="secondary">{earned.badge.code}</Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3" aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-lg font-semibold">
          Lịch sử tham gia
        </h2>
        {history.length === 0 ? (
          <EmptyState title="Chưa có hoạt động" description="Bạn chưa tham gia hoạt động nào." />
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={`${item.activityId}-${item.date}`}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{item.activityTitle}</p>
                  {item.taskName ? (
                    <p className="text-sm text-muted-foreground">{item.taskName}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <Badge variant="secondary">{item.status}</Badge>
                  <p className="pt-1 text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
