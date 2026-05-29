'use client'

import { useEffect, useState } from 'react'
import { getVolunteerDataSource } from '@/lib/datasource'
import type { VolunteerApplication, VolunteerStatus } from '@/lib/datasource/volunteer.datasource'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const filterOptions: { value: 'ALL' | VolunteerStatus; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
]

function statusBadgeVariant(status: VolunteerStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'APPROVED') return 'default'
  if (status === 'REJECTED') return 'destructive'
  return 'secondary'
}

export default function AdminVolunteerApplicationsPage() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [filter, setFilter] = useState<'ALL' | VolunteerStatus>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refetch(currentFilter: 'ALL' | VolunteerStatus) {
    setLoading(true)
    setError(null)
    try {
      const ds = getVolunteerDataSource()
      const list = await ds.list(currentFilter === 'ALL' ? undefined : currentFilter)
      setApplications(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải danh sách thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch(filter)
  }, [filter])

  async function handleReview(id: string, status: 'APPROVED' | 'REJECTED') {
    if (status === 'REJECTED' && !confirm('Xác nhận từ chối đơn này?')) {
      return
    }
    setBusyId(id)
    setError(null)
    try {
      const ds = getVolunteerDataSource()
      await ds.review(id, status)
      await refetch(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Đơn đăng ký TNV</h1>
      </div>

      <div className="flex gap-2">
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

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
      ) : applications.length === 0 ? (
        <p className="text-muted-foreground">Không có đơn nào.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>MSSV</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày nộp</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{app.fullName}</TableCell>
                <TableCell>{app.email}</TableCell>
                <TableCell>{app.phone}</TableCell>
                <TableCell>{app.studentId}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(app.status)}>{app.status}</Badge>
                </TableCell>
                <TableCell>{new Date(app.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                <TableCell className="text-right">
                  {app.status === 'PENDING' ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        disabled={busyId === app.id}
                        onClick={() => handleReview(app.id, 'APPROVED')}
                      >
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busyId === app.id}
                        onClick={() => handleReview(app.id, 'REJECTED')}
                      >
                        Từ chối
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">đã xử lý</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
