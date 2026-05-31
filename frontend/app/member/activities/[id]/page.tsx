'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CalendarRange } from 'lucide-react'
import { getMemberActivitiesDataSource } from '@/lib/datasource'
import type { Activity, Task } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ErrorState, LoadingState } from '@/components/shared/PageStates'

interface PreferenceState {
  [taskId: string]: number
}

const PREF_OPTIONS = [
  { value: 0, label: '0 — Không muốn' },
  { value: 1, label: '1 — Có thể' },
  { value: 2, label: '2 — Mong muốn' },
  { value: 3, label: '3 — Rất muốn' },
]

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}

const activityStatusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  MATCHED: 'Đã phân công',
  COMPLETED: 'Hoàn thành',
}

export default function MemberActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'submitted'>('loading')
  const [preferences, setPreferences] = useState<PreferenceState>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setStatus('loading')
    try {
      const detail = await getMemberActivitiesDataSource().getDetail(id)
      if (!detail) {
        setStatus('error')
        return
      }
      setActivity(detail.activity)
      setTasks(detail.tasks)
      const initial: PreferenceState = {}
      detail.tasks.forEach((t) => {
        initial[t.id] = 0
      })
      setPreferences(initial)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [id])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const prefs = Object.entries(preferences).map(([taskId, score]) => ({ taskId, score }))
      await getMemberActivitiesDataSource().submitRegistration(id, prefs)
      setStatus('submitted')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return <LoadingState />
  if (status === 'error' || !activity) return <ErrorState onRetry={fetchData} />

  if (status === 'submitted') {
    return (
      <Card
        variant="bento"
        className="border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-8 text-center"
      >
        <p className="svtn-eyebrow text-[color:var(--success)]">Đã ghi nhận</p>
        <h1 className="mt-2 text-h2">Đăng ký thành công!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hệ thống sẽ chạy matcher khi hoạt động đóng đăng ký và gửi thông báo phân công cho bạn.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card variant="bento" className="bg-primary p-6 text-primary-foreground sm:p-8">
        <Badge tone="primary" className="bg-white/15 text-primary-foreground">
          {activityStatusLabels[activity.status] ?? activity.status}
        </Badge>
        <h1 className="mt-3 text-h1 text-primary-foreground">{activity.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-primary-foreground/85">
          <span className="inline-flex items-center gap-2">
            <CalendarRange className="h-4 w-4" /> {formatDateTime(activity.startTime)} →{' '}
            {formatDateTime(activity.endTime)}
          </span>
        </div>
        {activity.description ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/85">
            {activity.description}
          </p>
        ) : null}
      </Card>

      <Card variant="bento" className="p-0">
        <CardHeader className="p-6">
          <CardTitle>Chấm điểm ưu tiên</CardTitle>
          <p className="text-sm text-muted-foreground">
            Chấm điểm 0–3 cho mỗi nhiệm vụ. Matcher sẽ ưu tiên nhiệm vụ bạn yêu thích nhất.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 p-6 pt-0">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Hoạt động này chưa có nhiệm vụ.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li key={task.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{task.name}</p>
                      {task.description ? (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {task.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">Slots: {task.slotCount}</p>
                    </div>
                    <Select
                      selectSize="sm"
                      aria-label={`Điểm ưu tiên cho ${task.name}`}
                      value={preferences[task.id] ?? 0}
                      onChange={(e) =>
                        setPreferences((prev) => ({ ...prev, [task.id]: Number(e.target.value) }))
                      }
                      className="w-44"
                    >
                      {PREF_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </Card>
                </li>
              ))}
            </ul>
          )}

          {error ? (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error}
            </p>
          ) : null}

          <div className="pt-2">
            <Button onClick={handleSubmit} disabled={submitting || tasks.length === 0} size="lg">
              {submitting ? 'Đang gửi...' : 'Gửi đăng ký'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
