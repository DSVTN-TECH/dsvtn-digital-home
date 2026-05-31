'use client'

import { useCallback, useEffect, useState } from 'react'
import { getGamificationDataSource } from '@/lib/datasource'
import type { LeaderboardResponse, StreakSummary } from '@/lib/datasource/gamification.datasource'
import { useAuth } from '@/hooks/useAuth'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { cn } from '@/lib/utils'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function lastMonths(count: number): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    out.push({ value, label: `Tháng ${d.getMonth() + 1}/${d.getFullYear()}` })
  }
  return out
}

function formatDate(value: string | null): string {
  if (!value) return 'Chưa ghi nhận'
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function calendarDays(
  month: string,
  streak: StreakSummary,
): { day: number; active: boolean; today: boolean }[] {
  const [year, monthNumber] = month.split('-').map(Number)
  const count = new Date(year, monthNumber, 0).getDate()
  const today = new Date()
  const last = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null
  const active = new Set<number>()
  if (last && last.getFullYear() === year && last.getMonth() + 1 === monthNumber) {
    for (let offset = 0; offset < streak.currentStreak; offset += 1) {
      const date = new Date(last)
      date.setDate(last.getDate() - offset)
      if (date.getMonth() + 1 === monthNumber) active.add(date.getDate())
    }
  }
  return Array.from({ length: count }, (_, index) => {
    const day = index + 1
    return {
      day,
      active: active.has(day),
      today:
        today.getFullYear() === year &&
        today.getMonth() + 1 === monthNumber &&
        today.getDate() === day,
    }
  })
}

const rankAccent = ['text-[#B7791F]', 'text-slate-500', 'text-[#8a4300]']
const rankMedal = ['🥇', '🥈', '🥉']

export default function MemberStreakPage() {
  const dataSource = getGamificationDataSource()
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonth())
  const [streak, setStreak] = useState<StreakSummary | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const [streakData, leaderboardData] = await Promise.all([
        dataSource.getStreak(),
        dataSource.getLeaderboard(month),
      ])
      setStreak(streakData)
      setLeaderboard(leaderboardData)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [dataSource, month])

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || !streak || !leaderboard) return <ErrorState onRetry={load} />

  const days = calendarDays(month, streak)
  const rewardRows = [
    ['+5', 'Check-in chiến dịch', formatDate(streak.lastActivityDate)],
    ['+1', 'Duy trì chuỗi ngày', `${streak.currentStreak} ngày liên tiếp`],
    [`+${streak.totalPoints}`, 'Tổng điểm tích lũy', 'Cập nhật từ hệ thống gamification'],
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card
        variant="bento"
        className="overflow-hidden bg-gradient-to-br from-primary to-[color:var(--navy)] p-0 text-primary-foreground"
      >
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/75">
              Chuỗi ngày hoạt động
            </p>
            <p className="mt-3 text-display leading-none">🔥 {streak.currentStreak} ngày</p>
            <p className="mt-3 max-w-2xl text-sm text-primary-foreground/80">
              Chuỗi sinh hoạt hiện tại, cập nhật khi bạn hoàn thành nhiệm vụ hoặc check-in hoạt
              động.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold">
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                Chuỗi dài nhất: {streak.longestStreak} ngày
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">
                Tổng điểm: {streak.totalPoints}
              </span>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{lastMonths(1)[0]?.label}</p>
              <span className="material-symbols-outlined" aria-hidden="true">
                calendar_month
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {days.slice(0, 35).map((item) => (
                <span
                  key={item.day}
                  className={cn(
                    'rounded-full py-1.5 font-semibold',
                    item.active
                      ? 'bg-white text-primary'
                      : 'bg-white/10 text-primary-foreground/70',
                    item.today && 'ring-2 ring-white/70',
                  )}
                >
                  {item.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="leaderboard-heading" className="space-y-4">
          <div className="svtn-section mb-4">
            <div>
              <h2 id="leaderboard-heading" className="text-h2">
                Bảng xếp hạng tháng
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Xếp hạng theo điểm tích lũy trong tháng.
              </p>
            </div>
            <label className="grid gap-1 text-sm">
              <span className="sr-only">Chọn tháng bảng xếp hạng</span>
              <Select
                selectSize="sm"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                aria-label="Chọn tháng bảng xếp hạng"
              >
                {lastMonths(12).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          {leaderboard.rows.length === 0 ? (
            <EmptyState title="Chưa có điểm" description="Chưa có điểm nào trong tháng này." />
          ) : (
            <ol className="space-y-2">
              {leaderboard.rows.map((row, index) => {
                const isMe = user?.id === row.userId
                return (
                  <li key={row.userId}>
                    <Card
                      className={cn(
                        'flex items-center gap-4 p-4',
                        isMe && 'border-primary bg-[color:var(--primary-soft)]',
                      )}
                    >
                      <span
                        className={cn(
                          'w-10 text-center text-lg font-extrabold',
                          rankAccent[index] ?? 'text-muted-foreground',
                        )}
                        aria-label={`Hạng ${index + 1}`}
                      >
                        {rankMedal[index] ?? `#${index + 1}`}
                      </span>
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                        aria-hidden="true"
                      >
                        {row.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {row.fullName}{' '}
                          {isMe ? (
                            <Badge tone="primary" className="ml-1">
                              Bạn
                            </Badge>
                          ) : null}
                        </p>
                      </div>
                      <span className="text-base font-extrabold text-primary">
                        {row.totalPoints} đ
                      </span>
                    </Card>
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <Card variant="bento" className="p-0">
          <div className="border-b border-border p-5">
            <h2 className="text-h3">Lịch sử điểm thưởng</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Các mốc điểm dùng để giải thích chuỗi hiện tại.
            </p>
          </div>
          <ul className="divide-y divide-border">
            {rewardRows.map(([points, title, detail]) => (
              <li key={title} className="flex items-center gap-4 p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--primary-soft)] text-sm font-extrabold text-primary">
                  {points}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
