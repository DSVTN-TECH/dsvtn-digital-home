'use client'

import { useCallback, useEffect, useState } from 'react'
import { getProfileDataSource } from '@/lib/datasource'
import type { MemberImpact, MemberProfileResponse } from '@/lib/datasource/profile.datasource'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

const historyStatusLabels: Record<string, string> = {
  PROPOSED: 'Đề xuất',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

export default function MemberProfilePage() {
  const dataSource = getProfileDataSource()
  const [data, setData] = useState<MemberProfileResponse | null>(null)
  const [impact, setImpact] = useState<MemberImpact | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [profile, impactData] = await Promise.all([
        dataSource.getProfile(),
        dataSource.getImpact(),
      ])
      setData(profile)
      setImpact(impactData)
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
  const nextBadgeProgress = impact ? Math.min(100, Math.round(impact.totalPoints % 100)) : 0

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row">
      <aside className="w-full flex-shrink-0 md:w-4/12">
        <Card
          variant="bento"
          className="flex flex-col items-center p-8 text-center md:sticky md:top-24"
        >
          <div
            className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[color:var(--primary-soft)] bg-primary text-3xl font-extrabold text-primary-foreground"
            aria-hidden="true"
          >
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-h2 text-foreground">{profile.fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
          <span className="badge-pill mt-4 inline-flex rounded-full bg-[color:var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-primary">
            {profile.role === 'MEMBER' ? 'Thành viên' : profile.role}
          </span>

          <dl className="mt-8 w-full space-y-4 border-t border-border pt-6 text-left">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">Tham gia từ</dt>
              <dd className="text-sm font-semibold text-foreground">
                {new Date(profile.joinedAt).toLocaleDateString('vi-VN')}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">Chiến dịch</dt>
              <dd className="text-sm font-semibold text-foreground">
                {impact?.totalActivities ?? 0} hoạt động
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-muted-foreground">Điểm công bằng</dt>
              <dd className="text-sm font-semibold text-primary">{profile.fairnessScore}</dd>
            </div>
          </dl>

          {impact ? (
            <div className="mt-6 w-full rounded-2xl bg-muted/60 p-4 text-left">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Huy hiệu tiếp theo</span>
                <span className="text-xs text-muted-foreground">{nextBadgeProgress}%</span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-surface-variant"
                aria-hidden="true"
              >
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${nextBadgeProgress}%` }}
                />
              </div>
            </div>
          ) : null}

          <button
            type="button"
            disabled
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            aria-disabled="true"
            title="Chỉnh sửa hồ sơ sẽ sớm ra mắt"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              edit
            </span>
            Chỉnh sửa hồ sơ
          </button>
        </Card>
      </aside>

      <main className="flex w-full flex-col gap-6 md:w-8/12">
        {impact ? (
          <section aria-label="Tác động" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              ['Nhiệm vụ', impact.completedAssignments],
              ['Hoạt động', impact.totalActivities],
              ['Điểm', impact.totalPoints],
              ['Huy hiệu', impact.badgeCount],
            ].map(([label, value]) => (
              <Card key={label} variant="bento" className="p-4 text-center">
                <p className="text-2xl font-extrabold text-foreground">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </Card>
            ))}
          </section>
        ) : null}

        <Card variant="bento" className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Huy hiệu</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {badges.length === 0 ? (
              <EmptyState
                title="Chưa có huy hiệu"
                description="Hoàn thành nhiệm vụ để mở khoá huy hiệu."
                className="bg-transparent shadow-none"
              />
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {badges.map((earned) => (
                  <li key={earned.id}>
                    <Card className="flex items-center gap-3 p-4">
                      <span
                        className="material-symbols-outlined rounded-2xl bg-[color:var(--primary-soft)] p-3 text-primary"
                        aria-hidden="true"
                      >
                        military_tech
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {earned.badge.name}
                        </p>
                        {earned.badge.description ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {earned.badge.description}
                          </p>
                        ) : null}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card variant="bento" className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Lịch sử tham gia</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {history.length === 0 ? (
              <EmptyState
                title="Chưa có hoạt động"
                description="Bạn chưa tham gia hoạt động nào."
                className="bg-transparent shadow-none"
              />
            ) : (
              <ul className="space-y-2">
                {history.map((item) => (
                  <li key={`${item.activityId}-${item.date}`}>
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {item.activityTitle}
                        </p>
                        {item.taskName ? (
                          <p className="truncate text-sm text-muted-foreground">{item.taskName}</p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <Badge tone="neutral" variant="outline">
                          {historyStatusLabels[item.status] ?? item.status}
                        </Badge>
                        <p className="pt-1 text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
