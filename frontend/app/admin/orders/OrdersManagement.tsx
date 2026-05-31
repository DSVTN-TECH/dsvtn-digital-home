'use client'

import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { Tabs } from '@/components/ui/tabs'
import { Sheet } from '@/components/ui/sheet'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import {
  ALLOWED_ORDER_TRANSITIONS,
  ORDER_STATUSES,
  getShopDataSource,
  type AdminOrder,
  type ShopOrderStatus as OrderStatus,
} from '@/lib/datasource'

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

const statusTone: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING_PAYMENT_REVIEW: 'warning',
  CONFIRMED: 'info',
  REJECTED: 'danger',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

const statusDot: Record<OrderStatus, string> = {
  PENDING_PAYMENT_REVIEW: 'bg-[color:var(--warning)]',
  CONFIRMED: 'bg-[color:var(--info)]',
  REJECTED: 'bg-destructive',
  DELIVERED: 'bg-[color:var(--success)]',
  CANCELLED: 'bg-destructive',
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
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [active, setActive] = useState<AdminOrder | null>(null)

  async function refetch(currentFilter: OrderFilter) {
    setStatus('loading')
    setError(null)
    try {
      const ds = getShopDataSource()
      setOrders(await ds.listAdminOrders(currentFilter === 'ALL' ? undefined : currentFilter))
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tải danh sách đơn hàng thất bại')
      setStatus('error')
    }
  }

  useEffect(() => {
    refetch(filter)
  }, [filter])

  const stats = useMemo(
    () =>
      ORDER_STATUSES.map((s) => ({
        status: s,
        label: statusLabels[s],
        count: orders.filter((o) => o.status === s).length,
      })),
    [orders],
  )

  const visibleOrders = useMemo(() => {
    if (!search.trim()) return orders
    const q = search.trim().toLowerCase()
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q) ||
        o.customerAddress.toLowerCase().includes(q),
    )
  }, [orders, search])

  async function handleUpdateStatus(order: AdminOrder, nextStatus: OrderStatus) {
    setBusyId(order.id)
    setError(null)
    try {
      const updated = await getShopDataSource().updateOrderStatus(order.id, nextStatus)
      setActive((cur) => (cur && cur.id === order.id ? updated : cur))
      await refetch(filter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Shop &amp; Đơn hàng</p>
          <h1 className="text-h1">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => (
          <StatCard
            key={item.status}
            label={item.label}
            value={item.count}
            tone={statusTone[item.status]}
          />
        ))}
      </div>

      <Card variant="bento" className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <span
              className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground"
              aria-hidden="true"
            >
              search
            </span>
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn, khách hàng, SĐT, địa chỉ..."
              className="pl-9"
              aria-label="Tìm đơn hàng"
            />
          </div>
          <Tabs
            ariaLabel="Lọc đơn hàng theo trạng thái"
            variant="segment"
            value={filter}
            onChange={(v) => setFilter(v as OrderFilter)}
            items={[
              { value: 'ALL', label: 'Tất cả' },
              ...ORDER_STATUSES.map((s) => ({ value: s, label: statusLabels[s] })),
            ]}
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        {status === 'loading' ? (
          <LoadingState title="Đang tải đơn hàng..." />
        ) : status === 'error' ? (
          <ErrorState onRetry={() => refetch(filter)} />
        ) : visibleOrders.length === 0 ? (
          <EmptyState
            title={search ? 'Không tìm thấy đơn hàng' : 'Không có đơn hàng'}
            description={
              search
                ? `Không có đơn nào khớp "${search}".`
                : 'Chưa có đơn hàng phù hợp với bộ lọc hiện tại.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <caption className="sr-only">Danh sách đơn hàng shop gây quỹ.</caption>
              <thead className="bg-[color:var(--primary-soft)]/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Mã đơn
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Khách hàng
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Địa chỉ
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Ngày tạo
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Minh chứng
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleOrders.map((order) => {
                  const nextStatuses = ALLOWED_ORDER_TRANSITIONS[order.status]
                  return (
                    <tr
                      key={order.id}
                      className="group transition-colors hover:bg-[color:var(--primary-soft)]/30"
                    >
                      <td className="px-4 py-3 font-semibold text-primary">
                        <button
                          type="button"
                          className="hover:underline"
                          onClick={() => setActive(order)}
                        >
                          {shortOrderId(order.id)}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                      </td>
                      <td className="max-w-[220px] px-4 py-3 text-xs text-muted-foreground">
                        <span className="line-clamp-2">{order.customerAddress}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {order.paymentProofUrl ? (
                          <a
                            href={order.paymentProofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--primary-soft)] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                            title="Xem minh chứng thanh toán"
                            aria-label={`Xem minh chứng thanh toán đơn ${shortOrderId(order.id)}`}
                          >
                            <span
                              className="material-symbols-outlined text-base"
                              aria-hidden="true"
                            >
                              receipt_long
                            </span>
                          </a>
                        ) : (
                          <span className="rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                            Chưa có
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone[order.status]}>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusDot[order.status]}`}
                            aria-hidden="true"
                          />
                          <span className="ml-1.5">{statusLabels[order.status]}</span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {nextStatuses.length > 0 ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            {nextStatuses.map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant={
                                  s === 'REJECTED' || s === 'CANCELLED'
                                    ? 'outline'
                                    : s === 'DELIVERED' || s === 'CONFIRMED'
                                      ? 'success'
                                      : 'default'
                                }
                                disabled={busyId === order.id}
                                onClick={() => handleUpdateStatus(order, s)}
                              >
                                {transitionLabels[s]}
                              </Button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Sheet
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `Đơn ${shortOrderId(active.id)}` : 'Chi tiết đơn'}
        description={active ? statusLabels[active.status] : undefined}
      >
        {active ? (
          <div className="space-y-4 text-sm">
            <Detail label="Khách hàng" value={active.customerName} />
            <Detail label="Số điện thoại" value={active.customerPhone} />
            <Detail label="Địa chỉ" value={active.customerAddress} />
            <Detail label="Ngày tạo" value={formatDate(active.createdAt)} />
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Minh chứng thanh toán
              </p>
              {active.paymentProofUrl ? (
                <a
                  href={active.paymentProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block break-all font-semibold text-primary hover:underline"
                >
                  {active.paymentProofUrl}
                </a>
              ) : (
                <p className="mt-1 text-sm text-destructive">Chưa có minh chứng</p>
              )}
            </div>
            {ALLOWED_ORDER_TRANSITIONS[active.status].length > 0 ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                {ALLOWED_ORDER_TRANSITIONS[active.status].map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={s === 'REJECTED' || s === 'CANCELLED' ? 'outline' : 'success'}
                    disabled={busyId === active.id}
                    onClick={() => handleUpdateStatus(active, s)}
                  >
                    {transitionLabels[s]}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </Sheet>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  )
}
