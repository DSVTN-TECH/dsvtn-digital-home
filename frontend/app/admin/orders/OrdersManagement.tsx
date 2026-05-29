'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ALLOWED_ORDER_TRANSITIONS,
  ORDER_STATUSES,
  getShopDataSource,
  type AdminOrder,
  type OrderStatus,
} from '@/lib/datasource/shop'

type OrderFilter = 'ALL' | OrderStatus

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT_REVIEW: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Từ chối',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

const transitionLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT_REVIEW: 'Chờ xác nhận',
  CONFIRMED: 'Xác nhận',
  REJECTED: 'Từ chối',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Hủy',
}

const filterOptions: { value: OrderFilter; label: string }[] = [
  { value: 'ALL', label: 'Tất cả' },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: statusLabels[status] })),
]

function badgeVariant(status: OrderStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'CONFIRMED' || status === 'DELIVERED') return 'default'
  if (status === 'REJECTED' || status === 'CANCELLED') return 'destructive'
  return 'secondary'
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('vi-VN')
}

function shortOrderId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`
}

interface OrdersManagementProps {
  title: string
  description: string
}

export function OrdersManagement({ title, description }: OrdersManagementProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [filter, setFilter] = useState<OrderFilter>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function refetch(currentFilter: OrderFilter) {
    setLoading(true)
    setError(null)
    try {
      const ds = getShopDataSource()
      setOrders(await ds.listAdminOrders(currentFilter === 'ALL' ? undefined : currentFilter))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải danh sách đơn hàng thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch(filter)
  }, [filter])

  const stats = useMemo(
    () =>
      ORDER_STATUSES.map((status) => ({
        status,
        label: statusLabels[status],
        count: orders.filter((order) => order.status === status).length,
      })),
    [orders],
  )

  async function handleUpdateStatus(order: AdminOrder, nextStatus: OrderStatus) {
    setBusyId(order.id)
    setError(null)
    try {
      const ds = getShopDataSource()
      const updated = await ds.updateOrderStatus(order.id, nextStatus)
      setOrders((current) =>
        current
          .map((item) => (item.id === order.id ? updated : item))
          .filter((item) => filter === 'ALL' || item.status === filter),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Shop & Đơn hàng</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => (
          <div key={item.status} className="rounded-md border bg-card p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.count}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
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
        <p className="text-muted-foreground">Đang tải đơn hàng...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">Không có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Địa chỉ</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Minh chứng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const nextStatuses = ALLOWED_ORDER_TRANSITIONS[order.status]
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{shortOrderId(order.id)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-56 text-sm text-muted-foreground">
                      {order.customerAddress}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <a
                        href={order.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary underline"
                      >
                        Mở link
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge variant={badgeVariant(order.status)}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {nextStatuses.length > 0 ? (
                        <div className="flex flex-wrap justify-end gap-2">
                          {nextStatuses.map((status) => (
                            <Button
                              key={status}
                              size="sm"
                              variant={
                                status === 'REJECTED' || status === 'CANCELLED'
                                  ? 'outline'
                                  : 'default'
                              }
                              disabled={busyId === order.id}
                              onClick={() => handleUpdateStatus(order, status)}
                            >
                              {transitionLabels[status]}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">đã xử lý</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
