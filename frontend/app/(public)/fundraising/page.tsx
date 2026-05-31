'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCampaignsDataSource } from '@/lib/datasource'
import type { CampaignWithProgress, FundraisingTransaction } from '@/lib/datasource'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

function daysUntil(value: string): number {
  const ms = new Date(value).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

function shortOrderId(id: string): string {
  return `MHX-${id.slice(-4).toUpperCase()}`
}

const fundAllocation = [
  {
    icon: 'card_giftcard',
    label: 'Quà tặng học sinh',
    percent: 40,
    iconClass: 'text-primary',
    barClass: 'bg-primary',
  },
  {
    icon: 'directions_bus',
    label: 'Chi phí đi lại',
    percent: 25,
    iconClass: 'text-[color:var(--info)]',
    barClass: 'bg-[color:var(--info)]',
  },
  {
    icon: 'menu_book',
    label: 'Vật tư dạy học',
    percent: 20,
    iconClass: 'text-[color:var(--warning)]',
    barClass: 'bg-[color:var(--warning)]',
  },
  {
    icon: 'content_paste',
    label: 'Chi phí khác',
    percent: 15,
    iconClass: 'text-muted-foreground',
    barClass: 'bg-muted-foreground',
  },
]

function statusLabel(status: FundraisingTransaction['status']): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Đã xác nhận'
    case 'DELIVERED':
      return 'Đã giao'
    case 'PENDING_PAYMENT_REVIEW':
      return 'Chờ duyệt'
    case 'REJECTED':
      return 'Từ chối'
    case 'CANCELLED':
      return 'Đã hủy'
  }
}

function MainProgressCard({ campaign }: { campaign: CampaignWithProgress }) {
  const { progress } = campaign
  const remainingCents = Math.max(0, campaign.goalCents - progress.raisedCents)
  const remainingDays = daysUntil(campaign.endDate)
  const avgCents =
    progress.orderCount > 0 ? Math.round(progress.raisedCents / progress.orderCount) : 0

  return (
    <Card variant="bento" className="p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="svtn-eyebrow">Chiến dịch đang mở</p>
          <h2 className="mt-1 text-h2 text-foreground">{campaign.title}</h2>
          {campaign.description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {campaign.description}
            </p>
          ) : null}
        </div>
        <Badge tone={progress.percent >= 100 ? 'success' : 'primary'}>
          {progress.percent >= 100 ? 'Đã đạt mục tiêu' : 'Đang diễn ra'}
        </Badge>
      </div>

      <div className="mb-2 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          {formatCurrency(progress.raisedCents)}
        </span>
        <span className="text-base font-semibold text-muted-foreground">
          / {formatCurrency(campaign.goalCents)}
        </span>
      </div>

      <div
        className="relative h-4 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Tiến độ ${campaign.title}`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, progress.percent)}%` }}
        />
      </div>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 md:grid-cols-3">
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined rounded-full bg-[color:var(--primary-soft)] p-3 text-primary"
            aria-hidden="true"
          >
            receipt_long
          </span>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Đơn thành công
            </dt>
            <dd className="text-lg font-bold text-foreground">{progress.orderCount}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined rounded-full bg-[color:var(--success)]/10 p-3 text-[color:var(--success)]"
            aria-hidden="true"
          >
            payments
          </span>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Giá trị đơn TB
            </dt>
            <dd className="text-lg font-bold text-foreground">{formatCurrency(avgCents)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="material-symbols-outlined rounded-full bg-[color:var(--warning)]/10 p-3 text-[color:var(--warning)]"
            aria-hidden="true"
          >
            schedule
          </span>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Còn lại
            </dt>
            <dd className="text-lg font-bold text-foreground">
              {remainingCents === 0 ? 'Đã đủ mục tiêu' : `${remainingDays} ngày`}
            </dd>
          </div>
        </div>
      </dl>
    </Card>
  )
}

export default function FundraisingPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithProgress[]>([])
  const [transactions, setTransactions] = useState<FundraisingTransaction[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const ds = getCampaignsDataSource()
      const [c, tx] = await Promise.all([
        ds.listPublic(),
        ds.listTransactions({ page: 1, pageSize: 8, status: 'CONFIRMED' }),
      ])
      setCampaigns(c)
      setTransactions(tx.items)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => {
    const raised = campaigns.reduce((acc, c) => acc + c.progress.raisedCents, 0)
    const goal = campaigns.reduce((acc, c) => acc + c.goalCents, 0)
    const orders = campaigns.reduce((acc, c) => acc + c.progress.orderCount, 0)
    const percent = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0
    return { raised, goal, orders, percent }
  }, [campaigns])

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-primary text-primary-foreground">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary to-[color:var(--navy)] opacity-90"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">
            Minh bạch tài chính
          </p>
          <h1 className="text-display max-w-2xl">Tiến độ gây quỹ ĐSVTN</h1>
          <p className="max-w-2xl text-base leading-7 text-primary-foreground/85">
            Mọi khoản ủng hộ được ghi nhận theo chiến dịch và công khai lịch sử giao dịch đã xác
            nhận. Thông tin cá nhân được ẩn một phần để bảo vệ quyền riêng tư của nhà hảo tâm.
          </p>
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link className="hover:text-primary" href="/">
              Trang chủ
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-primary" href="/shop">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground" aria-current="page">
            Tiến độ gây quỹ
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {status === 'loading' ? (
          <LoadingState title="Đang tải chiến dịch..." />
        ) : status === 'error' ? (
          <ErrorState onRetry={load} />
        ) : campaigns.length === 0 ? (
          <EmptyState
            title="Chưa có chiến dịch nào"
            description="Hiện chưa có chiến dịch gây quỹ đang mở."
          />
        ) : (
          <>
            <section aria-label="Chiến dịch đang mở" className="space-y-6">
              {campaigns.map((campaign) => (
                <MainProgressCard key={campaign.id} campaign={campaign} />
              ))}
            </section>

            <section
              aria-label="Tổng quan gây quỹ"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <StatCard
                label="Đơn đã xác nhận"
                value={summary.orders.toLocaleString('vi-VN')}
                icon="inventory_2"
                tone="primary"
              />
              <StatCard
                label="Đã gây quỹ"
                value={formatCurrency(summary.raised)}
                icon="savings"
                tone="success"
              />
              <StatCard
                label="Mục tiêu tổng"
                value={formatCurrency(summary.goal)}
                icon="ads_click"
                tone="info"
              />
              <StatCard
                label="Tỉ lệ hoàn thành"
                value={`${summary.percent}%`}
                icon="check_circle"
                tone="warning"
              />
            </section>

            <section aria-labelledby="fund-allocation-heading" className="space-y-4">
              <div>
                <h2 id="fund-allocation-heading" className="text-h2 text-foreground">
                  Kế hoạch sử dụng quỹ dự kiến
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cơ cấu tham chiếu từ kế hoạch chiến dịch, dùng để minh bạch mục tiêu phân bổ trước
                  khi quyết toán.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {fundAllocation.map((item) => (
                  <Card key={item.label} variant="bento" interactive className="p-5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined ${item.iconClass}`}
                        aria-hidden="true"
                      >
                        {item.icon}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">{item.label}</h3>
                    </div>
                    <p className="mt-5 text-2xl font-extrabold text-foreground">{item.percent}%</p>
                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
                      aria-hidden="true"
                    >
                      <div
                        className={`h-full rounded-full ${item.barClass}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section aria-label="Lịch sử giao dịch đã xác nhận">
              <Card variant="bento" className="overflow-hidden p-0">
                <div className="border-b border-border p-6">
                  <h2 className="text-h2 text-foreground">Lịch sử giao dịch đã xác nhận</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Thông tin cá nhân được ẩn một phần để bảo vệ quyền riêng tư của nhà hảo tâm.
                  </p>
                </div>
                {transactions.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-muted-foreground">
                    Chưa có giao dịch nào được xác nhận.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left">
                      <caption className="sr-only">
                        Giao dịch ủng hộ đã được xác nhận gần đây.
                      </caption>
                      <thead className="bg-[color:var(--primary-soft)] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="w-12 px-4 py-3">STT</th>
                          <th className="px-4 py-3">Mã đơn</th>
                          <th className="px-4 py-3">Người ủng hộ</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3 text-right">Số lượng</th>
                          <th className="px-4 py-3 text-right">Số tiền</th>
                          <th className="px-4 py-3 text-right">Ngày</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm">
                        {transactions.map((tx, index) => (
                          <tr
                            key={tx.id}
                            className="transition-colors hover:bg-[color:var(--primary-soft)]/40"
                          >
                            <td className="px-4 py-4 text-muted-foreground">{index + 1}</td>
                            <td className="px-4 py-4 font-semibold text-foreground">
                              {shortOrderId(tx.id)}
                            </td>
                            <td className="px-4 py-4 text-foreground">{tx.customerName}</td>
                            <td className="px-4 py-4">
                              <Badge
                                tone={
                                  tx.status === 'CONFIRMED' || tx.status === 'DELIVERED'
                                    ? 'success'
                                    : 'warning'
                                }
                              >
                                {statusLabel(tx.status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 text-right text-muted-foreground">
                              {tx.itemCount}
                            </td>
                            <td className="px-4 py-4 text-right font-semibold text-primary">
                              {formatCurrency(tx.totalCents)}
                            </td>
                            <td className="px-4 py-4 text-right text-muted-foreground">
                              {formatDate(tx.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="border-t border-border px-6 py-4 text-center">
                  <Button variant="ghost" size="sm" disabled>
                    Xem thêm lịch sử
                  </Button>
                </div>
              </Card>
            </section>
          </>
        )}
      </div>
    </>
  )
}
