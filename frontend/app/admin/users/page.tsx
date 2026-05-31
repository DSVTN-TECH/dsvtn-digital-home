'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Plus, X } from 'lucide-react'
import { apiFetch, ApiError } from '@/lib/api'
import type { User, CreateUserResponse } from '@/types/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const createUserSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  role: z.enum(['ADMIN', 'MEMBER', 'LOGISTIC'], { required_error: 'Role là bắt buộc' }),
})

type CreateUserForm = z.infer<typeof createUserSchema>

const roleTone: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'neutral'> = {
  ADMIN: 'warning',
  MEMBER: 'primary',
  LOGISTIC: 'info',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [showForm, setShowForm] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'MEMBER' | 'LOGISTIC'>('ALL')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema) })

  async function fetchUsers() {
    setStatus('loading')
    try {
      const data = await apiFetch<User[]>('/admin/users')
      setUsers(data)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const normalizedSearch = search.trim().toLowerCase()
  const visibleUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesSearch = normalizedSearch
      ? [user.fullName, user.email].some((value) => value.toLowerCase().includes(normalizedSearch))
      : true
    return matchesRole && matchesSearch
  })

  async function onSubmit(values: CreateUserForm) {
    setServerError(null)
    try {
      const res = await apiFetch<CreateUserResponse>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(values),
      })
      setTempPassword(res.temporaryPassword)
      reset()
      setShowForm(false)
      await fetchUsers()
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Tạo user thất bại')
    }
  }

  async function copyPassword() {
    if (!tempPassword) return
    await navigator.clipboard.writeText(tempPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="svtn-section">
        <div>
          <p className="svtn-eyebrow">Tài khoản</p>
          <h1 className="text-h1">Quản lý Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo, theo dõi và phân quyền tài khoản nội bộ.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm((v) => !v)
            setServerError(null)
          }}
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Huỷ
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Tạo user mới
            </>
          )}
        </Button>
      </div>

      {tempPassword ? (
        <Card
          variant="bento"
          className="border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-5"
        >
          <p className="text-sm font-bold text-[color:var(--success)]">
            User đã được tạo thành công!
          </p>
          <p className="mt-1 text-sm text-foreground">
            Mật khẩu tạm thời:{' '}
            <code className="rounded bg-card px-2 py-0.5 font-mono text-foreground">
              {tempPassword}
            </code>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={copyPassword}>
              <Copy className="h-4 w-4" /> {copied ? 'Đã copy!' : 'Copy mật khẩu'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setTempPassword(null)}>
              Đóng
            </Button>
          </div>
        </Card>
      ) : null}

      {showForm ? (
        <Card variant="bento" className="p-0">
          <CardHeader className="p-6">
            <CardTitle>Tạo user mới</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3">
              <FormField
                label="Họ tên"
                htmlFor="fullName"
                required
                error={errors.fullName?.message}
              >
                <Input id="fullName" invalid={!!errors.fullName} {...register('fullName')} />
              </FormField>
              <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
                <Input id="email" type="email" invalid={!!errors.email} {...register('email')} />
              </FormField>
              <FormField label="Vai trò" htmlFor="role" required error={errors.role?.message}>
                <Select id="role" invalid={!!errors.role} {...register('role')}>
                  <option value="">Chọn vai trò</option>
                  <option value="MEMBER">Member</option>
                  <option value="LOGISTIC">Logistic</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </FormField>
              {serverError ? (
                <p role="alert" className="sm:col-span-3 text-sm font-semibold text-destructive">
                  {serverError}
                </p>
              ) : null}
              <div className="sm:col-span-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo user'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {status === 'loading' ? (
        <LoadingSkeleton />
      ) : status === 'error' ? (
        <ErrorState onRetry={fetchUsers} />
      ) : users.length === 0 ? (
        <EmptyState
          title="Chưa có user"
          description="Tạo user nội bộ đầu tiên ở khung phía trên."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ADMIN', 'MEMBER', 'LOGISTIC'] as const).map((value) => (
                <Button
                  key={value}
                  variant={roleFilter === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(value)}
                >
                  {value === 'ALL' ? 'Tất cả' : value}
                </Button>
              ))}
            </div>
            <label className="relative block lg:w-64" htmlFor="user-search">
              <span className="sr-only">Tìm user theo tên hoặc email</span>
              <span
                aria-hidden="true"
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                search
              </span>
              <Input
                id="user-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc email"
                className="pl-10"
              />
            </label>
          </div>
          {visibleUsers.length === 0 ? (
            <EmptyState
              title="Không có user khớp"
              description="Hãy đổi bộ lọc hoặc từ khoá tìm kiếm."
            />
          ) : (
            <Card variant="bento" className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Danh sách user nội bộ và vai trò.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-semibold text-foreground">
                          {user.fullName}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge tone={roleTone[user.role] ?? 'neutral'}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge tone={user.status === 'ACTIVE' ? 'success' : 'neutral'}>
                            {user.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                          </Badge>
                          {user.mustChangePassword ? (
                            <Badge tone="warning" className="ml-1">
                              Cần đổi MK
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
