'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Pagination } from '@/components/ui/pagination'
import { StatCard } from '@/components/ui/stat-card'
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
import { getCampaignsDataSource } from '@/lib/datasource'
import type { CampaignOrderStatus as OrderStatus, PaginatedTransactions } from '@/lib/datasource'

const PAGE_SIZE = 20

const statusOptions: { value: '' | OrderStatus; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING_PAYMENT_REVIEW', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' },
]

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT_REVIEW: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Từ chối',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

const statusTone: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT_REVIEW: 'warning',
  CONFIRMED: 'info',
  REJECTED: 'danger',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('vi-VN')
}

export function FundraisingHistory() {
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedTransactions | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await getCampaignsDataSource().listTransactions({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter || undefined,
      })
      setData(result)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [page, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  function changeStatus(next: '' | OrderStatus) {
    setPage(1)
    setStatusFilter(next)
  }

  return (
    <div className="space-y-6">
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Gây quỹ</p>
          <h1 className="text-h1">Lịch sử giao dịch gây quỹ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Theo dõi toàn bộ giao dịch shop theo trạng thái.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-label text-foreground">Trạng thái</span>
            <Select
              selectSize="sm"
              className="w-48"
              value={statusFilter}
              onChange={(e) => changeStatus(e.target.value as '' | OrderStatus)}
              aria-label="Lọc theo trạng thái"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </label>
          {data ? (
            <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {data.pagination.total} giao dịch
            </p>
          ) : null}
        </div>
      </div>

      {status === 'loading' ? (
        <LoadingState title="Đang tải giao dịch..." />
      ) : status === 'error' || !data ? (
        <ErrorState onRetry={load} />
      ) : data.items.length === 0 ? (
        <EmptyState
          title="Chưa có giao dịch"
          description="Không có giao dịch nào khớp với bộ lọc hiện tại."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Quỹ đã nhận (trang này)"
              value={formatCurrency(
                data.items
                  .filter((tx) => tx.status === 'CONFIRMED' || tx.status === 'DELIVERED')
                  .reduce((sum, tx) => sum + tx.totalCents, 0),
              )}
              icon="payments"
              tone="success"
              description="Tổng đơn đã xác nhận/đã giao"
            />
            <StatCard
              label="Giao dịch (trang này)"
              value={data.items.length}
              icon="receipt_long"
              tone="info"
            />
            <StatCard
              label="Tổng giao dịch"
              value={data.pagination.total}
              icon="database"
              tone="primary"
            />
          </div>

          <Card variant="bento" className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>Lịch sử giao dịch gây quỹ theo bộ lọc.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-semibold text-foreground">
                        #{tx.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>{tx.customerName}</TableCell>
                      <TableCell>
                        <Badge tone={statusTone[tx.status]}>{statusLabels[tx.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{tx.itemCount}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {formatCurrency(tx.totalCents)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {data.pagination.page} / {Math.max(1, data.pagination.totalPages)}
            </p>
            <Pagination
              page={page}
              pageCount={Math.max(1, data.pagination.totalPages)}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  )
}
