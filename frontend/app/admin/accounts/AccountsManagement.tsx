'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { getInvitesDataSource } from '@/lib/datasource/invites'
import type { InviteItem, InviteStatus } from '@/lib/datasource/invites'

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Tài khoản</p>
        <h1 className="text-2xl font-semibold tracking-tight">Quản lý tài khoản & lời mời</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border bg-card p-4">
        <h2 className="font-medium">Mời thành viên mới</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" {...register('email')} />
            {errors.email ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="invite-role">Vai trò</Label>
            <select
              id="invite-role"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register('role')}
            >
              <option value="">Chọn vai trò</option>
              <option value="MEMBER">MEMBER</option>
              <option value="LOGISTIC">LOGISTIC</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            {errors.role ? (
              <p className="text-xs text-destructive" role="alert">
                {errors.role.message}
              </p>
            ) : null}
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Tạo lời mời'}
            </Button>
          </div>
        </div>
        {serverError ? (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        ) : null}
        {inviteLink ? (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
            <p className="font-medium text-green-800">Đã tạo lời mời. Sao chép link một lần:</p>
            <code className="mt-1 block break-all rounded bg-green-100 px-2 py-1 font-mono text-xs">
              {inviteLink}
            </code>
            <Button size="sm" variant="outline" className="mt-2" onClick={copyLink}>
              {copied ? 'Đã sao chép!' : 'Sao chép link'}
            </Button>
          </div>
        ) : null}
      </form>

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

      {status === 'loading' ? (
        <LoadingState title="Đang tải lời mời..." />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : invites.length === 0 ? (
        <EmptyState
          title="Chưa có lời mời"
          description="Tạo lời mời đầu tiên ở biểu mẫu phía trên."
        />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
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
              {invites.map((invite) => (
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
        </div>
      )}
    </div>
  )
}
