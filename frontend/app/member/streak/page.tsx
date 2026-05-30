'use client'

import { useCallback, useEffect, useState } from 'react'
import { getGamificationDataSource } from '@/lib/datasource'
import type { LeaderboardResponse, StreakSummary } from '@/lib/datasource/gamification.datasource'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export default function MemberStreakPage() {
  const dataSource = getGamificationDataSource()
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chuỗi ngày & bảng xếp hạng</h1>
        <p className="text-sm text-muted-foreground">
          Điểm được cập nhật sau khi nhiệm vụ hoàn thành.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Chuỗi hiện tại" value={`${streak.currentStreak} ngày`} />
        <Metric label="Chuỗi dài nhất" value={`${streak.longestStreak} ngày`} />
        <Metric label="Tổng điểm" value={String(streak.totalPoints)} />
      </div>

      <section className="space-y-4" aria-labelledby="leaderboard-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="leaderboard-heading" className="text-lg font-semibold">
              Bảng xếp hạng tháng
            </h2>
            <p className="text-sm text-muted-foreground">Tháng {leaderboard.month}</p>
          </div>
          <label className="grid gap-1 text-sm">
            Chọn tháng
            <Input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              aria-label="Chọn tháng bảng xếp hạng"
            />
          </label>
        </div>

        {leaderboard.rows.length === 0 ? (
          <EmptyState title="Chưa có điểm" description="Chưa có điểm nào trong tháng này." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hạng</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead className="text-right">Điểm</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.rows.map((row, index) => (
                <TableRow key={row.userId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{row.fullName}</TableCell>
                  <TableCell className="text-right">{row.totalPoints}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="pt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}
