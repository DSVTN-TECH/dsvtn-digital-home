'use client'

import { useCallback, useEffect, useState } from 'react'
import { getReportsDataSource } from '@/lib/datasource/reports'
import type { ReportsDashboard, StatusBucket } from '@/lib/datasource/reports'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

const activityStatusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  OPEN: 'Đang mở',
  CLOSED: 'Đã đóng',
  MATCHED: 'Đã ghép',
  COMPLETED: 'Hoàn thành',
}

const orderStatusLabels: Record<string, string> = {
  PENDING_PAYMENT_REVIEW: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  REJECTED: 'Từ chối',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="pt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function BreakdownList({
  title,
  buckets,
  labels,
}: {
  title: string
  buckets: StatusBucket[]
  labels: Record<string, string>
}) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0)
  return (
    <div className="rounded-lg border bg-card p-5">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-3 space-y-2">
        {buckets.map((bucket) => {
          const pct = total > 0 ? Math.round((bucket.count / total) * 100) : 0
          return (
            <li key={bucket.status} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>{labels[bucket.status] ?? bucket.status}</span>
                <span className="text-muted-foreground">
                  {bucket.count} ({pct}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function AdminDashboard() {
  const [data, setData] = useState<ReportsDashboard | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setData(await getReportsDataSource().getDashboard())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (status === 'loading') return <LoadingState title="Đang tải số liệu tổng quan..." />
  if (status === 'error' || !data) return <ErrorState onRetry={load} />

  const { kpis } = data
  const noData = kpis.totalUsers === 0 && kpis.totalActivities === 0 && kpis.totalOrders === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Tổng quan</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard quản trị</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Cập nhật: {new Date(data.generatedAt).toLocaleString('vi-VN')}
        </p>
      </div>

      {noData ? (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Hệ thống chưa ghi nhận hoạt động, người dùng hoặc đơn hàng nào."
        />
      ) : (
        <>
          <section
            aria-label="Chỉ số người dùng và hoạt động"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <KpiCard label="Người dùng" value={kpis.totalUsers} />
            <KpiCard label="Đang hoạt động" value={kpis.activeUsers} />
            <KpiCard label="Hoạt động" value={kpis.totalActivities} />
            <KpiCard label="Đang mở" value={kpis.openActivities} />
            <KpiCard label="Lượt đăng ký" value={kpis.totalRegistrations} />
            <KpiCard label="Phân công" value={kpis.totalAssignments} />
            <KpiCard label="Đơn TNV chờ duyệt" value={kpis.pendingApplications} />
            <KpiCard label="Doanh thu gây quỹ" value={formatCurrency(kpis.revenueCents)} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <BreakdownList
              title="Hoạt động theo trạng thái"
              buckets={data.breakdowns.activitiesByStatus}
              labels={activityStatusLabels}
            />
            <BreakdownList
              title="Đơn hàng theo trạng thái"
              buckets={data.breakdowns.ordersByStatus}
              labels={orderStatusLabels}
            />
          </section>
        </>
      )}
    </div>
  )
}
