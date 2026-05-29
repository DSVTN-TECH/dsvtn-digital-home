'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getActivitiesDataSource } from '@/lib/datasource'
import type { Activity, Task } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const taskSchema = z.object({
  name: z.string().min(1, 'Tên task là bắt buộc').max(100),
  description: z.string().max(2000).optional(),
  slotCount: z.coerce.number().int().min(0, 'Slot >= 0'),
  priority: z.coerce.number().int().optional(),
})
type TaskForm = z.infer<typeof taskSchema>

export default function AdminActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const ds = getActivitiesDataSource()
      const [act, t] = await Promise.all([ds.getById(id), ds.listTasks(id)])
      setActivity(act)
      setTasks(t)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function onAddTask(values: TaskForm) {
    setError(null)
    try {
      const ds = getActivitiesDataSource()
      await ds.addTask(id, values)
      reset()
      setShowTaskForm(false)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm task thất bại')
    }
  }

  if (loading) return <p className="text-muted-foreground">Đang tải...</p>
  if (!activity) return <p className="text-destructive">Không tìm thấy hoạt động.</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{activity.title}</h1>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
          <Badge variant="secondary">{activity.status}</Badge>
          <span>
            {new Date(activity.startTime).toLocaleString('vi-VN')} —{' '}
            {new Date(activity.endTime).toLocaleString('vi-VN')}
          </span>
        </div>
        {activity.description && <p className="mt-2 text-sm">{activity.description}</p>}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Tasks ({tasks.length})</h2>
        <Button size="sm" onClick={() => setShowTaskForm((v) => !v)}>
          {showTaskForm ? 'Huỷ' : 'Thêm task'}
        </Button>
      </div>

      {showTaskForm && (
        <form
          onSubmit={handleSubmit(onAddTask)}
          className="rounded-md border bg-card p-4 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" {...register('description')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slotCount">Slots *</Label>
              <Input id="slotCount" type="number" min={0} {...register('slotCount')} />
              {errors.slotCount && (
                <p className="text-xs text-destructive">{errors.slotCount.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input id="priority" type="number" defaultValue={0} {...register('priority')} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang thêm...' : 'Thêm'}
          </Button>
        </form>
      )}

      {tasks.length === 0 ? (
        <p className="text-muted-foreground">Chưa có task.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Mô tả</TableHead>
              <TableHead>Slots</TableHead>
              <TableHead>Priority</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>{t.description ?? '—'}</TableCell>
                <TableCell>{t.slotCount}</TableCell>
                <TableCell>{t.priority}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
