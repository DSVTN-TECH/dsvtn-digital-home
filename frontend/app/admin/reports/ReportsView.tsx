'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { getReportsDataSource, isOrderRow } from '@/lib/datasource/reports'
import type {
  ActivityReportRow,
  OrderReportRow,
  ReportDataset,
  ReportRow,
  ReportsOverview,
} from '@/lib/datasource/reports'

const PAGE_SIZE = 20

const datasetOptions: { value: ReportDataset; label: string }[] = [
  { value: 'activities', label: 'Hoạt động' },
  { value: 'orders', label: 'Đơn hàng' },
]

const statusOptions: Record<ReportDataset, { value: string; label: string }[]> = {
  activities: [
    { value: '', label: 'Tất cả' },
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'OPEN', label: 'Đang mở' },
    { value: 'CLOSED', label: 'Đã đóng' },
    { value: 'MATCHED', label: 'Đã ghép' },
    { value: 'COMPLETED', label: 'Hoàn thành' },
  ],
  orders: [
    { value: '', label: 'Tất cả' },
    { value: 'PENDING_PAYMENT_REVIEW', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'REJECTED', label: 'Từ chối' },
    { value: 'DELIVERED', label: 'Đã giao' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ],
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

function csvCell(value: string | number): string {
  const raw = String(value)
  if (!/[",\n]/.test(raw)) return raw
  return `"${raw.replace(/"/g, '""')}"`
}

function buildCsv(overview: ReportsOverview): string {
  const rows: (string | number)[][] =
    overview.dataset === 'orders'
      ? [
          ['id', 'customerName', 'status', 'itemCount', 'totalCents', 'createdAt'],
          ...(overview.items as OrderReportRow[]).map((row) => [
            row.id,
            row.customerName,
            row.status,
            row.itemCount,
            row.totalCents,
            row.createdAt,
          ]),
        ]
      : [
          [
            'id',
            'title',
            'status',
            'startTime',
            'endTime',
            'taskCount',
            'registrationCount',
            'assignmentCount',
          ],
          ...(overview.items as ActivityReportRow[]).map((row) => [
            row.id,
            row.title,
            row.status,
            row.startTime,
            row.endTime,
            row.taskCount,
            row.registrationCount,
            row.assignmentCount,
          ]),
        ]
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface Filters {
  dataset: ReportDataset
  status: string
  from: string
  to: string
}

const initialFilters: Filters = { dataset: 'activities', status: '', from: '', to: '' }

export function ReportsView() {
  const [filters, setFilters] = useState<Filters>(initialFilters)
  const [applied, setApplied] = useState<Filters>(initialFilters)
  const [page, setPage] = useState(1)
  const [overview, setOverview] = useState<ReportsOverview | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await getReportsDataSource().getOverview({
        dataset: applied.dataset,
        page,
        pageSize: PAGE_SIZE,
        status: applied.status || undefined,
        from: applied.from || undefined,
        to: applied.to || undefined,
      })
      setOverview(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [applied, page])

  useEffect(() => {
    void load()
  }, [load])

  function applyFilters(event: React.FormEvent) {
    event.preventDefault()
    setPage(1)
    setApplied(filters)
  }

  function resetFilters() {
    setFilters(initialFilters)
    setApplied(initialFilters)
    setPage(1)
  }

  const exportName = useMemo(
    () => `bao-cao-${applied.dataset}-${new Date().toISOString().slice(0, 10)}.csv`,
    [applied.dataset],
  )

  function handleExport() {
    if (!overview || overview.items.length === 0) return
    downloadCsv(exportName, buildCsv(overview))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Báo cáo & thống kê</p>
        <h1 className="text-2xl font-semibold tracking-tight">Báo cáo tổng hợp</h1>
      </div>

      <form
        onSubmit={applyFilters}
        className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="space-y-1">
          <Label htmlFor="report-dataset">Bộ dữ liệu</Label>
          <select
            id="report-dataset"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={filters.dataset}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                dataset: event.target.value as ReportDataset,
                status: '',
              }))
            }
          >
            {datasetOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="report-status">Trạng thái</Label>
          <select
            id="report-status"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            {statusOptions[filters.dataset].map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="report-from">Từ ngày</Label>
          <Input
            id="report-from"
            type="date"
            value={filters.from}
            onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="report-to">Đến ngày</Label>
          <Input
            id="report-to"
            type="date"
            value={filters.to}
            onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
          />
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit">Lọc</Button>
          <Button type="button" variant="outline" onClick={resetFilters}>
            Đặt lại
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {overview ? `${overview.pagination.total} bản ghi` : 'Đang tải...'}
          {overview?.summary.totalCents !== undefined
            ? ` · Tổng tiền: ${formatCurrency(overview.summary.totalCents)}`
            : ''}
          {overview?.summary.totalRegistrations !== undefined
            ? ` · Lượt đăng ký: ${overview.summary.totalRegistrations}`
            : ''}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={!overview || overview.items.length === 0}
        >
          Xuất CSV
        </Button>
      </div>

      {status === 'loading' ? (
        <LoadingState title="Đang tải báo cáo..." />
      ) : status === 'error' || !overview ? (
        <ErrorState onRetry={load} />
      ) : overview.items.length === 0 ? (
        <EmptyState
          title="Không có dữ liệu phù hợp"
          description="Thử thay đổi bộ lọc hoặc khoảng thời gian."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {applied.dataset === 'orders' ? (
                    <>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Hoạt động</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Nhiệm vụ</TableHead>
                      <TableHead className="text-right">Đăng ký</TableHead>
                      <TableHead className="text-right">Phân công</TableHead>
                      <TableHead>Bắt đầu</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.items.map((row: ReportRow) =>
                  isOrderRow(row) ? (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.customerName}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="text-right">{row.itemCount}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.totalCents)}</TableCell>
                      <TableCell>{formatDate(row.createdAt)}</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="text-right">{row.taskCount}</TableCell>
                      <TableCell className="text-right">{row.registrationCount}</TableCell>
                      <TableCell className="text-right">{row.assignmentCount}</TableCell>
                      <TableCell>{formatDate(row.startTime)}</TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {overview.pagination.page} / {Math.max(1, overview.pagination.totalPages)}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= overview.pagination.totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
