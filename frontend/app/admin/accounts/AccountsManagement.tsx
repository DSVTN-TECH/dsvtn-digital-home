'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { Select } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { getInvitesDataSource } from '@/lib/datasource'
import type { InviteItem, InviteStatus } from '@/lib/datasource'

const inviteSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  role: z.enum(['ADMIN', 'MEMBER', 'LOGISTIC'], { required_error: 'Vai trò là bắt buộc' }),
})

type InviteForm = z.infer<typeof inviteSchema>

const statusFilters: { value: '' | InviteStatus; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Đang chờ' },
  { value: 'ACCEPTED', label: 'Đã chấp nhận' },
  { value: 'EXPIRED', label: 'Hết hạn' },
  { value: 'REVOKED', label: 'Đã thu hồi' },
]

const statusLabels: Record<InviteStatus, string> = {
  PENDING: 'Đang chờ',
  ACCEPTED: 'Đã chấp nhận',
  EXPIRED: 'Hết hạn',
  REVOKED: 'Đã thu hồi',
}

function statusVariant(status: InviteStatus): 'default' | 'secondary' | 'destructive' {
  if (status === 'ACCEPTED') return 'default'
  if (status === 'REVOKED' || status === 'EXPIRED') return 'destructive'
  return 'secondary'
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('vi-VN')
}

export function AccountsManagement() {
  const [invites, setInvites] = useState<InviteItem[]>([])
  const [statusFilter, setStatusFilter] = useState<'' | InviteStatus>('')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [serverError, setServerError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) })

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await getInvitesDataSource().list(statusFilter || undefined)
      setInvites(result.items)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  async function onSubmit(values: InviteForm) {
    setServerError(null)
    setInviteLink(null)
    try {
      const created = await getInvitesDataSource().create(values)
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      setInviteLink(`${origin}/invite/accept?token=${created.token}`)
      reset()
      await load()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Tạo lời mời thất bại')
    }
  }

  async function copyLink() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function revoke(id: string) {
    setBusyId(id)
    setServerError(null)
    try {
      await getInvitesDataSource().revoke(id)
      await load()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Thu hồi lời mời thất bại')
    } finally {
      setBusyId(null)
    }
  }

  const pendingCount = invites.filter((invite) => invite.status === 'PENDING').length
  const acceptedCount = invites.filter((invite) => invite.status === 'ACCEPTED').length
  const inactiveCount = invites.filter(
    (invite) => invite.status === 'EXPIRED' || invite.status === 'REVOKED',
  ).length
  const normalizedSearch = search.trim().toLowerCase()
  const visibleInvites = normalizedSearch
    ? invites.filter((invite) =>
        [invite.email, invite.role, invite.status].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        ),
      )
    : invites

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--svtn-radius-bento)] bg-gradient-to-br from-primary to-[color:var(--navy)] p-5 text-primary-foreground shadow-[var(--svtn-shadow-md)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
          Tài khoản
        </p>
        <h1 className="mt-2 text-h1">Quản lý tài khoản & lời mời</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-primary-foreground/80">
          Tạo invite một lần, theo dõi trạng thái và thu hồi lời mời chưa sử dụng.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Đang chờ" value={pendingCount} icon="schedule" tone="warning" />
        <StatCard label="Đã chấp nhận" value={acceptedCount} icon="verified_user" tone="success" />
        <StatCard label="Không còn hiệu lực" value={inactiveCount} icon="block" tone="danger" />
      </div>

      <Card variant="bento" className="p-0">
        <CardHeader>
          <CardTitle>Mời thành viên mới</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-start">
              <FormField
                label="Email"
                htmlFor="invite-email"
                error={errors.email?.message}
                required
              >
                <Input
                  id="invite-email"
                  type="email"
                  invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </FormField>
              <FormField
                label="Vai trò"
                htmlFor="invite-role"
                error={errors.role?.message}
                required
              >
                <Select id="invite-role" invalid={Boolean(errors.role)} {...register('role')}>
                  <option value="">Chọn vai trò</option>
                  <option value="MEMBER">MEMBER</option>
                  <option value="LOGISTIC">LOGISTIC</option>
                  <option value="ADMIN">ADMIN</option>
                </Select>
              </FormField>
              <div className="flex items-end pt-7">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang gửi...' : 'Tạo lời mời'}
                </Button>
              </div>
            </div>
            {serverError ? (
              <p className="text-sm font-medium text-destructive" role="alert">
                {serverError}
              </p>
            ) : null}
            {inviteLink ? (
              <div className="rounded-2xl border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-4 text-sm shadow-sm">
                <p className="font-semibold text-[color:var(--success)]">
                  Đã tạo lời mời. Sao chép link một lần:
                </p>
                <code className="mt-2 block break-all rounded-lg bg-card px-3 py-2 font-mono text-xs">
                  {inviteLink}
                </code>
                <Button size="sm" variant="outline" className="mt-3" onClick={copyLink}>
                  {copied ? 'Đã sao chép!' : 'Sao chép link'}
                </Button>
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
        <label className="relative block lg:w-72" htmlFor="invite-search">
          <span className="sr-only">Tìm kiếm lời mời theo email hoặc vai trò</span>
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            search
          </span>
          <Input
            id="invite-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo email hoặc vai trò"
            className="pl-10"
          />
        </label>
      </div>

      {status === 'loading' ? (
        <LoadingState title="Đang tải lời mời..." />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : invites.length === 0 ? (
        <EmptyState
          title="Chưa có lời mời"
          description="Tạo lời mời đầu tiên ở biểu mẫu phía trên."
        />
      ) : visibleInvites.length === 0 ? (
        <EmptyState
          title="Không có lời mời khớp"
          description="Hãy đổi bộ lọc hoặc từ khoá tìm kiếm."
        />
      ) : (
        <Table>
          <TableCaption>
            Danh sách lời mời tài khoản kèm vai trò, trạng thái và hạn dùng.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hết hạn</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleInvites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">{invite.email}</TableCell>
                <TableCell>{invite.role}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(invite.status)}>
                    {statusLabels[invite.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(invite.expiresAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={invite.status !== 'PENDING' || busyId === invite.id}
                    onClick={() => revoke(invite.id)}
                  >
                    Thu hồi
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
