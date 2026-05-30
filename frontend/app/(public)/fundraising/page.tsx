'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCampaignsDataSource } from '@/lib/datasource/campaigns'
import type { CampaignWithProgress } from '@/lib/datasource/campaigns'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

function CampaignCard({ campaign }: { campaign: CampaignWithProgress }) {
  const { progress } = campaign
  return (
    <article className="rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">{campaign.title}</h2>
      {campaign.description ? (
        <p className="mt-1 text-sm text-muted-foreground">{campaign.description}</p>
      ) : null}

      <div className="mt-4 space-y-2">
        <div
          className="h-3 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tiến độ gây quỹ ${campaign.title}`}
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{progress.percent}%</span>
          <span className="text-muted-foreground">
            {formatCurrency(progress.raisedCents)} / {formatCurrency(campaign.goalCents)}
          </span>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Đơn ủng hộ</dt>
          <dd className="font-medium">{progress.orderCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Còn lại</dt>
          <dd className="font-medium">
            {formatCurrency(Math.max(0, campaign.goalCents - progress.raisedCents))}
          </dd>
        </div>
      </dl>
    </article>
  )
}

export default function FundraisingPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithProgress[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setCampaigns(await getCampaignsDataSource().listPublic())
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Tiến độ gây quỹ</h1>
        <p className="text-sm text-muted-foreground">
          Mọi khoản ủng hộ đều được ghi nhận minh bạch theo từng chiến dịch.
        </p>
      </header>

      {status === 'loading' ? (
        <LoadingState title="Đang tải chiến dịch..." />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="Chưa có chiến dịch nào"
          description="Hiện chưa có chiến dịch gây quỹ đang mở. Vui lòng quay lại sau."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </main>
  )
}
