'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { getActivitiesDataSource, getMatchingDataSource } from '@/lib/datasource'
import type { MatcherRunResult, SavedAssignment } from '@/lib/datasource/matching.datasource'
import type { Task } from '@/types/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const STATUS_OPTIONS = ['PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

function shortId(value: string) {
  return value.length > 10 ? `${value.slice(0, 8)}…` : value
}

const assignmentStatusLabels: Record<string, string> = {
  PROPOSED: 'Đề xuất',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

function statusTone(status: string) {
  if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success'
  if (status === 'CANCELLED') return 'danger'
  return 'warning'
}

function preferenceLabel(source: SavedAssignment['source']) {
  if (source === 'MANUAL') return { label: 'Override', tone: 'info' as const, icon: 'edit' }
  return { label: 'Matcher', tone: 'success' as const, icon: 'check_circle' }
}

export default function AdminMatcherPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<MatcherRunResult | null>(null)
  const [assignments, setAssignments] = useState<SavedAssignment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<SavedAssignment | null>(null)
  const [editForm, setEditForm] = useState({ userId: '', taskId: '', status: 'PROPOSED' })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const matchingSource = getMatchingDataSource()
      const activitiesSource = getActivitiesDataSource()
      const [loadedAssignments, loadedTasks] = await Promise.all([
        matchingSource.listAssignments(id),
        activitiesSource.listTasks(id).catch(() => [] as Task[]),
      ])
      setAssignments(loadedAssignments)
      setTasks(loadedTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu phân công')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks])

  const capacityRows = useMemo(() => {
    const taskIds = new Set<string>()
    tasks.forEach((task) => taskIds.add(task.id))
    assignments.forEach((assignment) => taskIds.add(assignment.taskId))
    result?.unfilledTasks.forEach((task) => taskIds.add(task.taskId))

    return Array.from(taskIds).map((taskId) => {
      const assigned = assignments.filter((assignment) => assignment.taskId === taskId).length
      const remaining =
        result?.unfilledTasks.find((task) => task.taskId === taskId)?.remainingSlots ?? 0
      const task = taskById.get(taskId)
      const slots = Math.max(task?.slotCount ?? assigned + remaining, assigned, 1)
      const percent = Math.min(100, Math.round((assigned / slots) * 100))
      return {
        taskId,
        name: task?.name ?? `Đầu việc ${shortId(taskId)}`,
        assigned,
        slots,
        percent,
      }
    })
  }, [assignments, result, taskById, tasks])

  const totalRegistered = result
    ? result.assignments.length + result.waitlist.length
    : assignments.length
  const matcherCount = assignments.filter((assignment) => assignment.source === 'MATCHER').length
  const manualCount = assignments.filter((assignment) => assignment.source === 'MANUAL').length
  const matcherRate =
    assignments.length > 0 ? Math.round((matcherCount / assignments.length) * 100) : 0
  const totalSlots = capacityRows.reduce((sum, row) => sum + row.slots, 0)
  const filledSlots = capacityRows.reduce((sum, row) => sum + row.assigned, 0)
  const fillRate = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const waitlistCount = result?.waitlist.length ?? 0

  async function handleRun() {
    setError(null)
    setRunning(true)
    try {
      const matchingSource = getMatchingDataSource()
      const runResult = await matchingSource.run(id)
      setResult(runResult)
      await fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chạy matcher thất bại')
    } finally {
      setRunning(false)
    }
  }

  function openEdit(assignment: SavedAssignment) {
    setEditing(assignment)
    setEditForm({ userId: assignment.userId, taskId: assignment.taskId, status: assignment.status })
  }

  async function handleOverride() {
    if (!editing) return
    setError(null)
    setSaving(true)
    try {
      const matchingSource = getMatchingDataSource()
      const updated = await matchingSource.overrideAssignment(editing.id, {
        userId: editForm.userId.trim() || undefined,
        taskId: editForm.taskId.trim() || undefined,
        status: editForm.status,
      })
      setAssignments((current) =>
        current.map((assignment) => (assignment.id === updated.id ? updated : assignment)),
      )
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật assignment thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[var(--svtn-radius-bento)] bg-gradient-to-br from-primary to-[color:var(--navy)] p-5 text-primary-foreground shadow-[var(--svtn-shadow-md)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
            Hệ thống ghép việc
          </p>
          <h1 className="mt-2 text-h1">Phân công TNV</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/80">
            Chạy matcher, theo dõi sức chứa từng đầu việc và xử lý override thủ công trong cùng một
            màn.
          </p>
        </div>
        <Button
          onClick={handleRun}
          disabled={running}
          variant="secondary"
          className="self-start sm:self-center"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            shuffle
          </span>
          {running ? 'Đang chạy...' : 'Chạy phân công'}
        </Button>
      </section>

      {error ? (
        <div
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="TNV đã đăng ký"
          value={totalRegistered}
          icon="group"
          tone="primary"
          description="Tổng người đã vào pipeline"
        />
        <StatCard
          label="Đầu việc"
          value={capacityRows.length}
          icon="assignment"
          tone="info"
          description={`${filledSlots}/${totalSlots} slot đã lấp đầy`}
        />
        <StatCard
          label="Tỉ lệ lấp đầy"
          value={`${fillRate}%`}
          icon="check_circle"
          tone="success"
          description={`${assignments.length} phân công hợp lệ`}
        />
        <StatCard
          label="Waitlist"
          value={waitlistCount}
          icon="hourglass_empty"
          tone="warning"
          description={`${manualCount} override thủ công`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card variant="bento" className="overflow-hidden lg:col-span-7">
          <CardHeader className="flex-row items-center justify-between border-b border-border">
            <div>
              <CardTitle>Kết quả phân công</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Bảng dense có scroll ngang trên mobile.
              </p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Lọc kết quả phân công">
              <span className="material-symbols-outlined" aria-hidden="true">
                filter_list
              </span>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="grid gap-3 p-5" role="status" aria-live="polite">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12" />
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Chưa có assignment. Chạy matcher để tạo phân công ban đầu.
              </div>
            ) : (
              <Table dense>
                <TableCaption>
                  Danh sách phân công tình nguyện viên theo đầu việc và trạng thái.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>MSSV/User</TableHead>
                    <TableHead>TNV</TableHead>
                    <TableHead>Đầu việc được gán</TableHead>
                    <TableHead>Xếp hạng NV</TableHead>
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment, index) => {
                    const preference = preferenceLabel(assignment.source)
                    return (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-mono text-xs">
                          {shortId(assignment.userId)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            <span className="font-semibold">TNV {shortId(assignment.userId)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge tone="primary">
                            {taskById.get(assignment.taskId)?.name ?? shortId(assignment.taskId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge tone={preference.tone}>{preference.label}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge tone={statusTone(assignment.status)}>
                            {assignmentStatusLabels[assignment.status] ?? assignment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openEdit(assignment)}>
                            Sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:col-span-5">
          <Card variant="bento">
            <CardHeader>
              <CardTitle>Sức chứa công việc</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {capacityRows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có đầu việc để hiển thị capacity.
                </p>
              ) : (
                capacityRows.map((row) => (
                  <div key={row.taskId} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                      <span className="truncate">{row.name}</span>
                      <span className="text-muted-foreground">
                        {row.assigned}/{row.slots}
                      </span>
                    </div>
                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      aria-label={`${row.name}: ${row.percent}% đã lấp đầy`}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card variant="bento">
            <CardHeader>
              <CardTitle>Nguồn phân công</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(var(--primary) 0 ${matcherRate * 3.6}deg, var(--warning) ${matcherRate * 3.6}deg 360deg)`,
                }}
                role="img"
                aria-label={`${matcherRate}% phân công từ matcher, ${100 - matcherRate}% override thủ công`}
              >
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-card">
                  <span className="text-2xl font-extrabold">{matcherRate}%</span>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-primary" />
                  Matcher ({matcherCount})
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3 w-3 rounded-full bg-[color:var(--warning)]" />
                  Override ({manualCount})
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card variant="bento">
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Điều chỉnh thủ công</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Kanban theo đầu việc, ưu tiên thao tác nhanh bằng bàn phím.
            </p>
          </div>
          <Button variant="subtle">
            <span className="material-symbols-outlined" aria-hidden="true">
              check_circle
            </span>
            Chốt phân công
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {capacityRows.map((row) => (
              <section
                key={row.taskId}
                className="min-w-72 rounded-2xl bg-muted/60 p-3"
                aria-label={`Cột ${row.name}`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold">{row.name}</h2>
                  <Badge tone="neutral">{row.assigned}</Badge>
                </div>
                <div className="space-y-3">
                  {assignments
                    .filter((assignment) => assignment.taskId === row.taskId)
                    .map((assignment) => (
                      <button
                        key={assignment.id}
                        type="button"
                        onClick={() => openEdit(assignment)}
                        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span
                          className="material-symbols-outlined text-muted-foreground"
                          aria-hidden="true"
                        >
                          drag_indicator
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-bold">
                            TNV {shortId(assignment.userId)}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {assignment.source === 'MANUAL' ? 'Điều chỉnh tay' : 'Matcher đề xuất'}
                          </span>
                        </span>
                      </button>
                    ))}
                </div>
              </section>
            ))}
            {result && result.waitlist.length > 0 ? (
              <section
                className="min-w-72 rounded-2xl bg-[color:var(--warning)]/10 p-3"
                aria-label="Danh sách chờ"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-bold">Waitlist</h2>
                  <Badge tone="warning">{result.waitlist.length}</Badge>
                </div>
                <div className="space-y-3">
                  {result.waitlist.map((userId) => (
                    <div
                      key={userId}
                      className="rounded-xl border border-border bg-card p-3 text-sm font-semibold shadow-sm"
                    >
                      TNV {shortId(userId)}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Sửa assignment"
        description="Điều chỉnh user, đầu việc hoặc trạng thái. Nguồn sẽ chuyển thành MANUAL sau khi lưu."
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Huỷ
            </Button>
            <Button onClick={handleOverride} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu override'}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <FormField label="User ID" htmlFor="edit-user-id" required>
            <Input
              id="edit-user-id"
              value={editForm.userId}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, userId: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Task ID" htmlFor="edit-task-id" required>
            <Input
              id="edit-task-id"
              value={editForm.taskId}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, taskId: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Trạng thái" htmlFor="edit-status" required>
            <Select
              id="edit-status"
              value={editForm.status}
              onChange={(event) =>
                setEditForm((current) => ({ ...current, status: event.target.value }))
              }
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </Dialog>
    </div>
  )
}
