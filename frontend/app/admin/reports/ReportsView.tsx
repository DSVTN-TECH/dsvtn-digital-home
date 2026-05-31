'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { Pagination } from '@/components/ui/pagination'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { getReportsDataSource, isOrderRow } from '@/lib/datasource'
import type {
  ActivityReportRow,
  OrderReportRow,
  ReportDataset,
  ReportRow,
  ReportsOverview,
} from '@/lib/datasource'

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

function reportStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: 'Nháp',
    OPEN: 'Đang mở',
    CLOSED: 'Đã đóng',
    MATCHED: 'Đã phân công',
    COMPLETED: 'Hoàn thành',
    PENDING_PAYMENT_REVIEW: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    REJECTED: 'Từ chối',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
  }
  return labels[status] ?? status
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
      <section className="rounded-[var(--svtn-radius-bento)] bg-gradient-to-br from-primary to-[color:var(--navy)] p-5 text-primary-foreground shadow-[var(--svtn-shadow-md)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
          Báo cáo & thống kê
        </p>
        <h1 className="mt-2 text-h1">Báo cáo tổng hợp</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/80">
          Theo dõi hoạt động, đơn hàng và xuất CSV cho đối soát nội bộ.
        </p>
      </section>

      <Card variant="bento" className="p-0">
        <CardHeader>
          <CardTitle>Bộ lọc báo cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={applyFilters} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <FormField label="Bộ dữ liệu" htmlFor="report-dataset">
              <Select
                id="report-dataset"
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
              </Select>
            </FormField>

            <FormField label="Trạng thái" htmlFor="report-status">
              <Select
                id="report-status"
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, status: event.target.value }))
                }
              >
                {statusOptions[filters.dataset].map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Từ ngày" htmlFor="report-from">
              <Input
                id="report-from"
                type="date"
                value={filters.from}
                onChange={(event) => setFilters((prev) => ({ ...prev, from: event.target.value }))}
              />
            </FormField>

            <FormField label="Đến ngày" htmlFor="report-to">
              <Input
                id="report-to"
                type="date"
                value={filters.to}
                onChange={(event) => setFilters((prev) => ({ ...prev, to: event.target.value }))}
              />
            </FormField>

            <div className="flex items-end gap-2">
              <Button type="submit">Lọc</Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Đặt lại
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status" aria-live="polite">
        <StatCard
          label="Bản ghi"
          value={overview?.pagination.total ?? '—'}
          icon="table_rows"
          tone="primary"
        />
        <StatCard
          label="Tổng tiền"
          value={
            overview?.summary.totalCents !== undefined
              ? formatCurrency(overview.summary.totalCents)
              : '—'
          }
          icon="payments"
          tone="success"
        />
        <StatCard
          label="Lượt đăng ký"
          value={overview?.summary.totalRegistrations ?? '—'}
          icon="how_to_reg"
          tone="info"
        />
        <Card variant="bento" className="flex flex-col justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Xuất dữ liệu</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              CSV theo bộ lọc đang áp dụng.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!overview || overview.items.length === 0}
          >
            Xuất CSV
          </Button>
        </Card>
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
          <Table>
            <TableCaption>
              {applied.dataset === 'orders'
                ? 'Bảng đơn hàng theo bộ lọc đang áp dụng.'
                : 'Bảng hoạt động theo bộ lọc đang áp dụng.'}
            </TableCaption>
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
                    <TableCell>
                      <Badge tone="neutral">{reportStatusLabel(row.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.itemCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.totalCents)}</TableCell>
                    <TableCell>{formatDate(row.createdAt)}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      <Badge tone="neutral">{reportStatusLabel(row.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{row.taskCount}</TableCell>
                    <TableCell className="text-right">{row.registrationCount}</TableCell>
                    <TableCell className="text-right">{row.assignmentCount}</TableCell>
                    <TableCell>{formatDate(row.startTime)}</TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {overview.pagination.page} / {Math.max(1, overview.pagination.totalPages)}
            </p>
            <Pagination
              page={overview.pagination.page}
              pageCount={Math.max(1, overview.pagination.totalPages)}
              onPageChange={setPage}
              ariaLabel="Phân trang báo cáo"
            />
          </div>
        </>
      )}
    </div>
  )
}
