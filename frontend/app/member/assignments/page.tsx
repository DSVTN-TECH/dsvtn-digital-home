'use client'

import { useEffect, useState } from 'react'
import { getMemberActivitiesDataSource, getMemberAssignmentsDataSource } from '@/lib/datasource'
import type { MemberAssignment } from '@/lib/datasource/assignments.datasource'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AssignmentRow extends MemberAssignment {
  activityTitle: string
}

export default function MemberAssignmentsPage() {
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const activitiesDs = getMemberActivitiesDataSource()
        const assignmentsDs = getMemberAssignmentsDataSource()
        const activities = await activitiesDs.listOpen()

        const collected: AssignmentRow[] = []
        for (const activity of activities) {
          const assignments = await assignmentsDs.listMyAssignments(activity.id)
          for (const a of assignments) {
            collected.push({ ...a, activityTitle: activity.title })
          }
        }
        setRows(collected)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tải phân công thất bại')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function statusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    if (status === 'CONFIRMED' || status === 'COMPLETED') return 'default'
    if (status === 'CANCELLED') return 'destructive'
    return 'secondary'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Phân công của tôi</h1>

      {error && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">Bạn chưa được phân công vào task nào.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hoạt động</TableHead>
              <TableHead>Task ID</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.activityTitle}</TableCell>
                <TableCell className="font-mono text-xs">{r.taskId.slice(0, 8)}...</TableCell>
                <TableCell>
                  <Badge variant="secondary">{r.source}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
