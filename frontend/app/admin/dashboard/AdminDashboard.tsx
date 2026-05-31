'use client'

import { useCallback, useEffect, useState } from 'react'
import { getReportsDataSource } from '@/lib/datasource'
import type { ReportsDashboard, ReportsDashboardKpis, StatusBucket } from '@/lib/datasource'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'

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

interface ActionItem {
  icon: string
  title: string
  description: string
  href: string
  cta: string
}

function buildActions(kpis: ReportsDashboardKpis): ActionItem[] {
  const actions: ActionItem[] = []
  if (kpis.pendingApplications > 0) {
    actions.push({
      icon: 'person_check',
      title: `Duyệt ${kpis.pendingApplications} hồ sơ TNV mới`,
      description: 'Đơn đăng ký đang chờ xét duyệt.',
      href: '/admin/volunteer-applications',
      cta: 'Xem đơn',
    })
  }
  const pendingOrders = Math.max(0, kpis.totalOrders - kpis.deliveredOrders - kpis.confirmedOrders)
  if (pendingOrders > 0 || kpis.confirmedOrders > 0) {
    actions.push({
      icon: 'inventory_2',
      title: `${kpis.confirmedOrders} đơn hàng cần đóng gói`,
      description: 'Trạng thái CONFIRMED chờ chuyển hậu cần.',
      href: '/admin/orders',
      cta: 'Xử lý',
    })
  }
  if (kpis.openActivities > 0) {
    actions.push({
      icon: 'assignment_late',
      title: `${kpis.openActivities} hoạt động đang mở`,
      description: 'Theo dõi tiến độ phân công và hoàn thành.',
      href: '/admin/activities',
      cta: 'Phân công',
    })
  }
  return actions
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
    <Card variant="bento" className="p-0">
      <CardHeader className="p-6">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-6 pt-0">
        {buckets.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có dữ liệu.</p>
        ) : (
          <ul className="space-y-3">
            {buckets.map((bucket) => {
              const pct = total > 0 ? Math.round((bucket.count / total) * 100) : 0
              return (
                <li key={bucket.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {labels[bucket.status] ?? bucket.status}
                    </span>
                    <span className="text-muted-foreground">
                      {bucket.count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function BarChart({
  buckets,
  labels,
}: {
  buckets: StatusBucket[]
  labels: Record<string, string>
}) {
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1)
  return (
    <div className="flex min-h-72 items-end gap-3 border-b border-border pt-8">
      {buckets.map((bucket) => {
        const height = Math.max(12, Math.round((bucket.count / max) * 100))
        return (
          <div key={bucket.status} className="group flex flex-1 flex-col items-center gap-2">
            <div className="relative flex h-56 w-full items-end">
              <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-lg bg-foreground px-2 py-1 text-xs font-semibold text-background group-hover:block">
                {bucket.count}
              </span>
              <div
                className="w-full rounded-t-xl bg-[color:var(--primary-soft)] transition-colors group-hover:bg-primary"
                style={{ height: `${height}%` }}
                aria-label={`${labels[bucket.status] ?? bucket.status}: ${bucket.count}`}
              />
            </div>
            <span className="max-w-20 truncate text-xs font-semibold text-muted-foreground">
              {labels[bucket.status] ?? bucket.status}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({
  buckets,
  labels,
}: {
  buckets: StatusBucket[]
  labels: Record<string, string>
}) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.count, 0)
  let offset = 0
  const colors = ['#1a56a0', '#c9dafe', '#ffb786', '#12805C', '#C2413A']
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-48 w-48">
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 100 100"
          role="img"
          aria-label="Biểu đồ donut đơn hàng"
        >
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e2e9" strokeWidth="15" />
          {buckets.map((bucket, index) => {
            const fraction = total > 0 ? bucket.count / total : 0
            const dash = `${fraction * 251.2} 251.2`
            const circle = (
              <circle
                key={bucket.status}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeWidth="15"
              />
            )
            offset += fraction * 251.2
            return circle
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-foreground">{total}</span>
          <span className="text-xs font-semibold text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="grid w-full gap-3">
        {buckets.map((bucket, index) => (
          <div key={bucket.status} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              {labels[bucket.status] ?? bucket.status}
            </span>
            <span className="font-semibold text-foreground">{bucket.count}</span>
          </div>
        ))}
      </div>
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

  if (status === 'loading') return <LoadingSkeleton className="lg:grid-cols-4" />
  if (status === 'error' || !data) return <ErrorState onRetry={load} />

  const { kpis } = data
  const noData = kpis.totalUsers === 0 && kpis.totalActivities === 0 && kpis.totalOrders === 0

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="svtn-eyebrow">Tổng quan</p>
          <h1 className="text-h1">Dashboard quản trị</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, Admin. Cập nhật {new Date(data.generatedAt).toLocaleString('vi-VN')}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground">
            <span className="material-symbols-outlined" aria-hidden="true">
              event
            </span>
            {new Date(data.generatedAt).toLocaleDateString('vi-VN', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <Button variant="outline">Xuất báo cáo</Button>
        </div>
      </header>

      {noData ? (
        <EmptyState
          title="Chưa có dữ liệu"
          description="Hệ thống chưa ghi nhận hoạt động, người dùng hoặc đơn hàng nào."
        />
      ) : (
        <>
          <section
            aria-label="Chỉ số tổng quan"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              label="TNV chờ duyệt"
              value={kpis.pendingApplications}
              icon="person_search"
              tone="warning"
              description={`${kpis.totalApplications} đơn tổng cộng`}
            />
            <StatCard
              label="Đơn hàng đang chờ"
              value={kpis.confirmedOrders}
              icon="shopping_bag"
              tone="info"
              description={`${kpis.totalOrders} đơn tổng cộng`}
            />
            <StatCard
              label="Hoạt động đang mở"
              value={kpis.openActivities}
              icon="campaign"
              tone="primary"
              description={`${kpis.totalActivities} hoạt động tổng`}
            />
            <StatCard
              label="Doanh thu gây quỹ"
              value={formatCurrency(kpis.revenueCents)}
              icon="volunteer_activism"
              tone="success"
              description={`${kpis.deliveredOrders} đơn đã giao`}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-12">
            <Card variant="bento" className="lg:col-span-7">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Hoạt động theo trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart
                  buckets={data.breakdowns.activitiesByStatus}
                  labels={activityStatusLabels}
                />
              </CardContent>
            </Card>
            <Card variant="bento" className="lg:col-span-5">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Đơn hàng theo trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <DonutChart buckets={data.breakdowns.ordersByStatus} labels={orderStatusLabels} />
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card variant="bento">
              <CardHeader className="flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-1.5 rounded-full bg-destructive" aria-hidden="true" />
                  <CardTitle>Cần xử lý ngay</CardTitle>
                </div>
                <Badge tone="danger">{buildActions(kpis).length} việc</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {buildActions(kpis).length === 0 ? (
                  <EmptyState
                    title="Bạn đã xử lý hết"
                    description="Không còn việc nào chờ xử lý."
                  />
                ) : (
                  buildActions(kpis).map((action) => (
                    <article
                      key={action.title}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                    >
                      <div className="flex gap-3">
                        <span
                          className="material-symbols-outlined rounded-2xl bg-[color:var(--primary-soft)] p-3 text-primary"
                          aria-hidden="true"
                        >
                          {action.icon}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{action.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <Link href={action.href}>{action.cta}</Link>
                      </Button>
                    </article>
                  ))
                )}
              </CardContent>
            </Card>

            <BreakdownList
              title="Phân bổ phân công"
              buckets={data.breakdowns.activitiesByStatus}
              labels={activityStatusLabels}
            />
          </section>
        </>
      )}
    </div>
  )
}
