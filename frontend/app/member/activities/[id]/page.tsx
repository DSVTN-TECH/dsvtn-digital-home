'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMemberActivitiesDataSource } from '@/lib/datasource'
import type { Activity, Task } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface PreferenceState {
  [taskId: string]: number
}

export default function MemberActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [preferences, setPreferences] = useState<PreferenceState>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const ds = getMemberActivitiesDataSource()
      const detail = await ds.getDetail(id)
      if (detail) {
        setActivity(detail.activity)
        setTasks(detail.tasks)
        const initial: PreferenceState = {}
        detail.tasks.forEach((t) => {
          initial[t.id] = 0
        })
        setPreferences(initial)
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    try {
      const ds = getMemberActivitiesDataSource()
      const prefs = Object.entries(preferences).map(([taskId, score]) => ({ taskId, score }))
      await ds.submitRegistration(id, prefs)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="text-muted-foreground">Đang tải...</p>
  if (!activity) return <p className="text-destructive">Không tìm thấy hoạt động.</p>

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">Đăng ký thành công!</h2>
        <p className="mt-2 text-sm text-green-700">Preferences của bạn đã được ghi nhận.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{activity.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(activity.startTime).toLocaleString('vi-VN')} —{' '}
          {new Date(activity.endTime).toLocaleString('vi-VN')}
        </p>
        {activity.description && <p className="mt-2 text-sm">{activity.description}</p>}
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground">Hoạt động này chưa có task.</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">Chấm điểm ưu tiên (0 = không muốn, 3 = rất muốn)</h2>
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">{task.name}</p>
                {task.description && (
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                )}
                <p className="text-xs text-muted-foreground">Slots: {task.slotCount}</p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`score-${task.id}`} className="text-sm">
                  Score:
                </Label>
                <select
                  id={`score-${task.id}`}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                  value={preferences[task.id] ?? 0}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, [task.id]: Number(e.target.value) }))
                  }
                >
                  {[0, 1, 2, 3].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi đăng ký'}
          </Button>
        </div>
      )}
    </div>
  )
}
