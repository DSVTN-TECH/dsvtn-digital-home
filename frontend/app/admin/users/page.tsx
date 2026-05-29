'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiFetch, ApiError } from '@/lib/api'
import type { User, CreateUserResponse } from '@/types/api'
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

const createUserSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  role: z.enum(['ADMIN', 'MEMBER', 'LOGISTIC'], { required_error: 'Role là bắt buộc' }),
})

type CreateUserForm = z.infer<typeof createUserSchema>

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema) })

  async function fetchUsers() {
    try {
      const data = await apiFetch<User[]>('/admin/users')
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Quản lý Users</h1>
        <Button
          onClick={() => {
            setShowForm((v) => !v)
            setServerError(null)
          }}
        >
          {showForm ? 'Huỷ' : 'Tạo user mới'}
        </Button>
      </div>

      {tempPassword && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-medium text-green-800">User đã được tạo thành công!</p>
          <p className="mt-1 text-green-700">
            Mật khẩu tạm thời:{' '}
            <code className="rounded bg-green-100 px-1 font-mono">{tempPassword}</code>
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" onClick={copyPassword}>
              {copied ? 'Đã copy!' : 'Copy mật khẩu'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setTempPassword(null)}>
              Đóng
            </Button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="rounded-md border bg-card p-4 space-y-4">
          <h2 className="font-medium">Tạo user mới</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ tên</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                {...register('role')}
              >
                <option value="">Chọn role</option>
                <option value="MEMBER">MEMBER</option>
                <option value="LOGISTIC">LOGISTIC</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>
          </div>
          {serverError && <p className="text-sm text-destructive">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo user'}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-muted-foreground">Đang tải...</p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">Chưa có user nào.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ngày tạo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Badge variant={u.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
