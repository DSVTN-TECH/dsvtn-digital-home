'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { getCampaignsDataSource } from '@/lib/datasource/campaigns'
import type { OrderStatus, PaginatedTransactions } from '@/lib/datasource/campaigns'

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
      <div>
        <p className="text-sm text-muted-foreground">Gây quỹ</p>
        <h1 className="text-2xl font-semibold tracking-tight">Lịch sử giao dịch gây quỹ</h1>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="tx-status">Trạng thái</Label>
          <select
            id="tx-status"
            className="h-9 w-48 rounded-md border border-input bg-background px-3 text-sm"
            value={statusFilter}
            onChange={(event) => changeStatus(event.target.value as '' | OrderStatus)}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {data ? (
          <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
            {data.pagination.total} giao dịch
          </p>
        ) : null}
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
          <div className="overflow-x-auto rounded-md border">
            <Table>
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
                    <TableCell className="font-medium">#{tx.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell>{tx.customerName}</TableCell>
                    <TableCell>{statusLabels[tx.status]}</TableCell>
                    <TableCell className="text-right">{tx.itemCount}</TableCell>
                    <TableCell className="text-right">{formatCurrency(tx.totalCents)}</TableCell>
                    <TableCell>{formatDate(tx.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Trang {data.pagination.page} / {Math.max(1, data.pagination.totalPages)}
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
                disabled={page >= data.pagination.totalPages}
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
