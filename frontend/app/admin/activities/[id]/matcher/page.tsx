'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getMatchingDataSource } from '@/lib/datasource'
import type { MatcherRunResult, SavedAssignment } from '@/lib/datasource/matching.datasource'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function AdminMatcherPage() {
  const { id } = useParams<{ id: string }>()
  const [result, setResult] = useState<MatcherRunResult | null>(null)
  const [assignments, setAssignments] = useState<SavedAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<SavedAssignment | null>(null)
  const [editForm, setEditForm] = useState({ userId: '', taskId: '', status: 'PROPOSED' })

  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const ds = getMatchingDataSource()
      setAssignments(await ds.listAssignments(id))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  async function handleRun() {
    setError(null)
    setRunning(true)
    try {
      const ds = getMatchingDataSource()
      const res = await ds.run(id)
      setResult(res)
      await fetchAssignments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chạy matcher thất bại')
    } finally {
      setRunning(false)
    }
  }

  function openEdit(assignment: SavedAssignment) {
    setEditing(assignment)
    setEditForm({
      userId: assignment.userId,
      taskId: assignment.taskId,
      status: assignment.status,
    })
  }

  async function handleOverride() {
    if (!editing) return
    setError(null)
    try {
      const ds = getMatchingDataSource()
      const updated = await ds.overrideAssignment(editing.id, {
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
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Matcher</h1>
        <Button onClick={handleRun} disabled={running}>
          {running ? 'Đang chạy...' : 'Run Matcher'}
        </Button>
      </div>

      {error && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4 rounded-md border bg-card p-4">
          <h2 className="font-medium">Kết quả lần chạy mới nhất</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold">{result.assignments.length}</p>
              <p className="text-xs text-muted-foreground">Assignments</p>
            </div>
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold">{result.waitlist.length}</p>
              <p className="text-xs text-muted-foreground">Waitlist</p>
            </div>
            <div className="rounded-md border p-3 text-center">
              <p className="text-2xl font-bold">{result.unfilledTasks.length}</p>
              <p className="text-xs text-muted-foreground">Unfilled Tasks</p>
            </div>
          </div>

          {result.waitlist.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Waitlist</h3>
              <p className="text-sm text-muted-foreground">{result.waitlist.join(', ')}</p>
            </div>
          )}

          {result.unfilledTasks.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">Unfilled Tasks</h3>
              {result.unfilledTasks.map((t) => (
                <p key={t.taskId} className="text-sm text-muted-foreground">
                  Task {t.taskId}: {t.remainingSlots} slots còn trống
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-medium">Assignments đã lưu</h2>
        {loading ? (
          <p className="text-muted-foreground">Đang tải...</p>
        ) : assignments.length === 0 ? (
          <p className="text-muted-foreground">Chưa có assignment. Chạy matcher để tạo.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Task ID</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.userId.slice(0, 8)}...</TableCell>
                  <TableCell className="font-mono text-xs">{a.taskId.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{a.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{a.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                      Sửa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-md border bg-background p-5 shadow-lg">
            <h2 className="text-lg font-semibold">Sửa assignment</h2>
            <div className="mt-4 grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-user-id">User ID</Label>
                <Input
                  id="edit-user-id"
                  value={editForm.userId}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, userId: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-id">Task ID</Label>
                <Input
                  id="edit-task-id"
                  value={editForm.taskId}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, taskId: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm((current) => ({ ...current, status: event.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {['PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Huỷ
              </Button>
              <Button onClick={handleOverride}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
