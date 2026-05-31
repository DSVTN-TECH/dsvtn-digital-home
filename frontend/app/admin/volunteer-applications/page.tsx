'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getVolunteerDataSource } from '@/lib/datasource'
import type { VolunteerApplication, VolunteerStatus } from '@/lib/datasource/volunteer.datasource'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { Tabs } from '@/components/ui/tabs'
import { ErrorState, LoadingState, EmptyState } from '@/components/shared/PageStates'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const filterOptions = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
] as const

const volunteerStatusLabels: Record<VolunteerStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
}

function statusTone(status: VolunteerStatus): 'success' | 'warning' | 'danger' {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'danger'
  return 'warning'
}

export default function AdminVolunteerApplicationsPage() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([])
  const [filter, setFilter] = useState<'ALL' | VolunteerStatus>('ALL')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  async function refetch(currentFilter: 'ALL' | VolunteerStatus) {
    setStatus('loading')
    setError(null)
    try {
      const ds = getVolunteerDataSource()
      const list = await ds.list(currentFilter === 'ALL' ? undefined : currentFilter)
      setApplications(list)
      setSelected(new Set())
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải danh sách thất bại')
      setStatus('error')
    }
  }

  useEffect(() => {
    refetch(filter)
  }, [filter])

  async function reviewOne(id: string, target: 'APPROVED' | 'REJECTED') {
    setBusyId(id)
    setError(null)
    try {
      await getVolunteerDataSource().review(id, target)
      await refetch(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại')
    } finally {
      setBusyId(null)
    }
  }

  async function reviewSelected(target: 'APPROVED' | 'REJECTED') {
    if (selected.size === 0) return
    if (target === 'REJECTED' && !confirm(`Từ chối ${selected.size} đơn?`)) return
    const ds = getVolunteerDataSource()
    setError(null)
    try {
      await Promise.all([...selected].map((id) => ds.review(id, target)))
      await refetch(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại')
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const normalizedSearch = search.trim().toLowerCase()
  const filteredApplications = normalizedSearch
    ? applications.filter((app) =>
        [app.fullName, app.email, app.phone, app.studentId]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(normalizedSearch)),
      )
    : applications
  const pendingCount = applications.filter((app) => app.status === 'PENDING').length
  const approvedCount = applications.filter((app) => app.status === 'APPROVED').length
  const rejectedCount = applications.filter((app) => app.status === 'REJECTED').length

  return (
    <div className="space-y-6">
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Quản lý TNV</p>
          <h1 className="text-h1">Danh sách form đăng ký</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Duyệt đơn TNV và tạo tài khoản nội bộ.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="success"
            size="sm"
            disabled={selected.size === 0}
            onClick={() => reviewSelected('APPROVED')}
          >
            Duyệt đã chọn ({selected.size})
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={selected.size === 0}
            onClick={() => reviewSelected('REJECTED')}
          >
            Từ chối đã chọn
          </Button>
        </div>
      </div>

      <Tabs
        ariaLabel="Bộ lọc trạng thái đơn"
        variant="segment"
        value={filter}
        onChange={(v) => setFilter(v as typeof filter)}
        items={filterOptions.map((opt) => ({ value: opt.value, label: opt.label }))}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Chờ duyệt" value={pendingCount} icon="schedule" tone="warning" />
        <StatCard label="Đã duyệt" value={approvedCount} icon="verified" tone="success" />
        <StatCard label="Từ chối" value={rejectedCount} icon="block" tone="danger" />
      </div>

      <label className="relative block max-w-md" htmlFor="volunteer-search">
        <span className="sr-only">Tìm kiếm theo tên, email, MSSV</span>
        <span
          aria-hidden="true"
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          search
        </span>
        <Input
          id="volunteer-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên, email hoặc MSSV"
          className="pl-10"
        />
      </label>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {status === 'loading' ? (
        <LoadingState />
      ) : status === 'error' ? (
        <ErrorState onRetry={() => refetch(filter)} />
      ) : filteredApplications.length === 0 ? (
        <EmptyState
          title="Không có đơn nào khớp"
          description="Hãy thử bộ lọc hoặc từ khoá tìm kiếm khác."
        />
      ) : (
        <Card variant="bento" className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>Danh sách đơn TNV theo trạng thái.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <span className="sr-only">Chọn</span>
                  </TableHead>
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
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Chọn đơn ${app.fullName}`}
                        checked={selected.has(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        disabled={app.status !== 'PENDING'}
                      />
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      <Link
                        href={`/admin/volunteer-applications/${app.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {app.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.phone}</TableCell>
                    <TableCell>{app.studentId}</TableCell>
                    <TableCell>
                      <Badge tone={statusTone(app.status)}>
                        {volunteerStatusLabels[app.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(app.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      {app.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            disabled={busyId === app.id}
                            onClick={() => reviewOne(app.id, 'APPROVED')}
                          >
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === app.id}
                            onClick={() => reviewOne(app.id, 'REJECTED')}
                          >
                            Từ chối
                          </Button>
                        </div>
                      ) : (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/volunteer-applications/${app.id}`}>Chi tiết</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
