'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { getActivitiesDataSource } from '@/lib/datasource'
import type { Activity, Task } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const activityStatusLabels: Record<Activity['status'], string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  MATCHED: 'Đã phân công',
  COMPLETED: 'Hoàn thành',
}

function statusTone(status: Activity['status']): 'primary' | 'success' | 'warning' | 'neutral' {
  if (status === 'OPEN') return 'success'
  if (status === 'DRAFT') return 'warning'
  if (status === 'COMPLETED') return 'primary'
  return 'neutral'
}

const taskSchema = z.object({
  name: z.string().min(1, 'Tên task là bắt buộc').max(100),
  description: z.string().max(2000).optional(),
  slotCount: z.coerce.number().int().min(0, 'Slot >= 0'),
  priority: z.coerce.number().int().optional(),
})

type TaskForm = z.infer<typeof taskSchema>

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
}

export default function AdminActivityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'notfound'>('loading')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskForm>({ resolver: zodResolver(taskSchema) })

  const fetchData = useCallback(async () => {
    setStatus('loading')
    try {
      const ds = getActivitiesDataSource()
      const [act, t] = await Promise.all([ds.getById(id), ds.listTasks(id)])
      if (!act) {
        setStatus('notfound')
        return
      }
      setActivity(act)
      setTasks(t)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [id])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  async function onAddTask(values: TaskForm) {
    setError(null)
    try {
      await getActivitiesDataSource().addTask(id, values)
      reset()
      setShowTaskForm(false)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm task thất bại')
    }
  }

  if (status === 'loading') return <LoadingState />
  if (status === 'error') return <ErrorState onRetry={fetchData} />
  if (status === 'notfound' || !activity) return <EmptyState title="Không tìm thấy hoạt động" />

  const totalSlots = tasks.reduce((sum, task) => sum + task.slotCount, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/activities">
            <ArrowLeft className="h-4 w-4" /> Danh sách hoạt động
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/activities/${id}/matcher`}>Mở Task Matcher</Link>
          </Button>
          <Button disabled title="Xuất bản nhanh sẽ sớm ra mắt">
            Xuất bản
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card variant="bento" className="overflow-hidden p-0">
            <div className="bg-gradient-to-br from-primary to-[color:var(--navy)] p-6 text-primary-foreground sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                    Hoạt động
                  </p>
                  <h1 className="mt-2 text-h1 text-primary-foreground">{activity.title}</h1>
                  <p className="mt-2 text-sm text-primary-foreground/80">
                    {formatDateTime(activity.startTime)} — {formatDateTime(activity.endTime)}
                  </p>
                </div>
                <Badge tone={statusTone(activity.status)} className="bg-white/95">
                  {activityStatusLabels[activity.status]}
                </Badge>
              </div>
            </div>
          </Card>

          <Card variant="bento" className="p-0">
            <CardHeader className="p-6">
              <CardTitle>Thông tin hoạt động</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 pt-0 sm:grid-cols-2">
              <Info label="Tên hoạt động" value={activity.title} className="sm:col-span-2" />
              <Info label="Ngày bắt đầu" value={formatDateTime(activity.startTime)} />
              <Info label="Ngày kết thúc" value={formatDateTime(activity.endTime)} />
              <div className="rounded-2xl border border-border bg-background p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Mô tả
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  {activity.description || 'Chưa có mô tả.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="bento" className="p-0">
            <CardHeader className="flex flex-row items-center justify-between p-6">
              <div>
                <CardTitle>Danh sách đầu việc ({tasks.length})</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tổng sức chứa: {totalSlots} TNV.
                </p>
              </div>
              <Button size="sm" onClick={() => setShowTaskForm((v) => !v)}>
                {showTaskForm ? (
                  <>
                    <X className="h-4 w-4" /> Huỷ
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Thêm task
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              {showTaskForm ? (
                <form
                  onSubmit={handleSubmit(onAddTask)}
                  className="grid gap-4 rounded-2xl border border-border bg-background p-4 sm:grid-cols-4"
                >
                  <FormField
                    label="Tên"
                    htmlFor="task-name"
                    required
                    error={errors.name?.message}
                    className="sm:col-span-2"
                  >
                    <Input id="task-name" invalid={!!errors.name} {...register('name')} />
                  </FormField>
                  <FormField
                    label="Slots"
                    htmlFor="task-slots"
                    required
                    error={errors.slotCount?.message}
                  >
                    <Input
                      id="task-slots"
                      type="number"
                      min={0}
                      invalid={!!errors.slotCount}
                      {...register('slotCount')}
                    />
                  </FormField>
                  <FormField label="Priority" htmlFor="task-priority">
                    <Input
                      id="task-priority"
                      type="number"
                      defaultValue={0}
                      {...register('priority')}
                    />
                  </FormField>
                  <FormField label="Mô tả" htmlFor="task-desc" className="sm:col-span-4">
                    <Input id="task-desc" {...register('description')} />
                  </FormField>
                  {error ? (
                    <p
                      role="alert"
                      className="text-sm font-semibold text-destructive sm:col-span-4"
                    >
                      {error}
                    </p>
                  ) : null}
                  <div className="sm:col-span-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Đang thêm...' : 'Thêm task'}
                    </Button>
                  </div>
                </form>
              ) : null}

              {tasks.length === 0 ? (
                <EmptyState
                  title="Chưa có đầu việc"
                  description="Tạo đầu việc để mở đăng ký TNV."
                  className="bg-transparent shadow-none"
                />
              ) : (
                <Table>
                  <TableCaption>Danh sách đầu việc của hoạt động.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Đầu việc</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right">Slots</TableHead>
                      <TableHead className="text-right">Ưu tiên</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-semibold text-foreground">{task.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {task.description ?? '—'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{task.slotCount}</TableCell>
                        <TableCell className="text-right">{task.priority}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card variant="bento" className="p-5">
            <p className="svtn-eyebrow">Cài đặt đăng ký</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-muted p-3">
                <span className="text-muted-foreground">Trạng thái</span>
                <Badge tone={statusTone(activity.status)}>
                  {activityStatusLabels[activity.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted p-3">
                <span className="text-muted-foreground">Đầu việc</span>
                <span className="font-bold text-foreground">{tasks.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-muted p-3">
                <span className="text-muted-foreground">Sức chứa</span>
                <span className="font-bold text-foreground">{totalSlots}</span>
              </div>
            </div>
          </Card>
          <Card variant="soft" className="p-5">
            <p className="text-sm font-semibold text-foreground">Preview công khai</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              TNV sẽ thấy tên hoạt động, mô tả, thời gian và danh sách đầu việc khi hoạt động mở
              đăng ký.
            </p>
          </Card>
          <Button asChild className="w-full">
            <Link href={`/admin/activities/${id}/matcher`}>Chạy phân công</Link>
          </Button>
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div
      className={
        className
          ? `rounded-2xl border border-border bg-background p-4 ${className}`
          : 'rounded-2xl border border-border bg-background p-4'
      }
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  )
}
