'use client'

import { useEffect, useState } from 'react'
import { getMemberActivitiesDataSource, getMemberAssignmentsDataSource } from '@/lib/datasource'
import type { MemberAssignment } from '@/lib/datasource/assignments.datasource'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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

interface AssignmentRow extends MemberAssignment {
  activityTitle: string
}

const statusLabels: Record<MemberAssignment['status'], string> = {
  PROPOSED: 'Đề xuất',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
}

const sourceLabels: Record<MemberAssignment['source'], string> = {
  MATCHER: 'Matcher',
  MANUAL: 'Thủ công',
}

function statusTone(
  status: MemberAssignment['status'],
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success'
  if (status === 'CANCELLED') return 'danger'
  if (status === 'PROPOSED') return 'warning'
  return 'neutral'
}

export default function MemberAssignmentsPage() {
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  function load() {
    setStatus('loading')
    setError(null)
    async function run() {
      try {
        const activitiesDs = getMemberActivitiesDataSource()
        const assignmentsDs = getMemberAssignmentsDataSource()
        const activities = await activitiesDs.listOpen()
        const collected: AssignmentRow[] = []
        for (const activity of activities) {
          const assignments = await assignmentsDs.listMyAssignments(activity.id)
          for (const a of assignments) collected.push({ ...a, activityTitle: activity.title })
        }
        setRows(collected)
        setStatus('ready')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Tải phân công thất bại')
        setStatus('error')
      }
    }
    void run()
  }

  useEffect(() => {
    load()
  }, [])

  const confirmedCount = rows.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'COMPLETED',
  ).length

  return (
    <div className="space-y-6">
      <div>
        <p className="svtn-eyebrow">Member Zone</p>
        <h1 className="text-h1">Phân công của tôi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Các nhiệm vụ bạn được matcher hoặc admin phân công.
        </p>
      </div>

      {status === 'loading' ? (
        <LoadingState />
      ) : status === 'error' ? (
        <ErrorState
          title="Không thể tải phân công"
          description={error ?? undefined}
          onRetry={load}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title="Chưa có phân công"
          description="Bạn chưa được phân công vào nhiệm vụ nào."
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {rows.length} phân công · {confirmedCount} đã xác nhận
          </p>
          <Card variant="bento" className="p-0">
            <Table>
              <TableCaption>Danh sách nhiệm vụ được phân công cho thành viên.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Hoạt động</TableHead>
                  <TableHead>Mã đầu việc</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{r.activityTitle}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.taskId.slice(0, 8)}…
                    </TableCell>
                    <TableCell>
                      <Badge tone={r.source === 'MANUAL' ? 'info' : 'primary'}>
                        {sourceLabels[r.source]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge tone={statusTone(r.status)}>{statusLabels[r.status]}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  )
}
