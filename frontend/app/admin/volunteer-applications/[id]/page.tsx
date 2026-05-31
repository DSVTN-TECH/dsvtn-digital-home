'use client'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getVolunteerDataSource } from '@/lib/datasource'
import type { VolunteerApplication, VolunteerStatus } from '@/lib/datasource/volunteer.datasource'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'

const statusLabels: Record<VolunteerStatus, string> = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
}

function statusTone(status: VolunteerStatus): 'success' | 'warning' | 'danger' {
  if (status === 'APPROVED') return 'success'
  if (status === 'REJECTED') return 'danger'
  return 'warning'
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có'
}

export default function VolunteerApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [application, setApplication] = useState<VolunteerApplication | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'notfound'>('loading')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const rows = await getVolunteerDataSource().list()
      const found = rows.find((row) => row.id === id)
      setApplication(found ?? null)
      setStatus(found ? 'ready' : 'notfound')
    } catch {
      setStatus('error')
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  async function review(target: 'APPROVED' | 'REJECTED') {
    if (target === 'REJECTED' && !confirm('Từ chối đơn đăng ký này?')) return
    setBusy(true)
    try {
      const updated = await getVolunteerDataSource().review(id, target)
      setApplication(updated)
      setStatus('ready')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading') return <LoadingState />
  if (status === 'error') return <ErrorState onRetry={load} />
  if (status === 'notfound' || !application)
    return (
      <EmptyState
        title="Không tìm thấy đơn"
        description="Đơn đăng ký này không tồn tại hoặc đã bị xoá."
      />
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/volunteer-applications">
            <ArrowLeft className="h-4 w-4" /> Danh sách đơn
          </Link>
        </Button>
        {application.status === 'PENDING' ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="success" disabled={busy} onClick={() => review('APPROVED')}>
              Duyệt đơn
            </Button>
            <Button variant="destructive" disabled={busy} onClick={() => review('REJECTED')}>
              Từ chối
            </Button>
          </div>
        ) : null}
      </div>

      <Card variant="bento" className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary to-[color:var(--navy)] p-6 text-primary-foreground sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
                Tình nguyện viên
              </p>
              <h1 className="mt-2 text-h1 text-primary-foreground">{application.fullName}</h1>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Nộp ngày {formatDate(application.createdAt)}
              </p>
            </div>
            <Badge tone={statusTone(application.status)} className="bg-white/95">
              {statusLabels[application.status]}
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <Card variant="bento" className="p-6 text-center xl:sticky xl:top-24 xl:self-start">
          <div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-3xl font-extrabold text-primary"
            aria-hidden="true"
          >
            {application.fullName.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-h3 text-foreground">{application.fullName}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{application.email}</p>
          <dl className="mt-6 space-y-3 text-left text-sm">
            <Info label="Mã số sinh viên" value={application.studentId} />
            <Info label="Số điện thoại" value={application.phone} />
            <Info label="Trạng thái" value={statusLabels[application.status]} />
          </dl>
        </Card>

        <div className="space-y-6">
          <Card variant="bento" className="p-0">
            <CardHeader className="p-6">
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 pt-0 sm:grid-cols-2">
              <Info label="Email" value={application.email} />
              <Info label="Số điện thoại" value={application.phone} />
              <Info label="MSSV" value={application.studentId} />
              <Info label="Ngày nộp" value={formatDate(application.createdAt)} />
            </CardContent>
          </Card>

          <Card variant="bento" className="p-0">
            <CardHeader className="p-6">
              <CardTitle>Ghi chú & nguyện vọng</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="rounded-3xl border border-border bg-background p-5 text-sm leading-7 text-muted-foreground">
                {application.note || 'Ứng viên chưa để lại ghi chú.'}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card variant="bento" className="p-5">
            <p className="svtn-eyebrow">Review flow</p>
            <h2 className="mt-2 text-h3">Lịch sử xét duyệt</h2>
            <ol className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-foreground">Đã nhận form</p>
                  <p className="text-muted-foreground">{formatDate(application.createdAt)}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--warning)]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-foreground">Trạng thái hiện tại</p>
                  <p className="text-muted-foreground">{statusLabels[application.status]}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-1 h-2.5 w-2.5 rounded-full bg-[color:var(--success)]"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-foreground">Người xét duyệt</p>
                  <p className="text-muted-foreground">
                    {application.reviewedById ?? 'Chưa phân công'}
                  </p>
                  <p className="text-muted-foreground">{formatDate(application.reviewedAt)}</p>
                </div>
              </li>
            </ol>
          </Card>
          <Card variant="soft" className="p-5">
            <p className="text-sm font-semibold text-foreground">Gợi ý thao tác</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Duyệt đơn sẽ chuyển ứng viên sang hàng chờ cấp tài khoản nội bộ theo workflow hiện
              tại.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-semibold text-foreground">{value}</p>
    </div>
  )
}
