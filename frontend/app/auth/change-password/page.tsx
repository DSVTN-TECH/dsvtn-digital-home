'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ApiError } from '@/lib/api'
import { getAuthDataSource, MockAuthError } from '@/lib/datasource'
import { getRoleHomePath, useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Mật khẩu xác nhận không khớp',
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export default function ChangePasswordPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  useEffect(() => {
    if (isLoading) return
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }
    if (user && !user.mustChangePassword) {
      router.replace(getRoleHomePath(user.role))
    }
  }, [isLoading, isLoggedIn, user, router])

  async function onSubmit(values: ChangePasswordForm) {
    setServerError(null)
    try {
      const changedUser = await getAuthDataSource().changePassword(
        values.currentPassword,
        values.newPassword,
      )
      router.replace(getRoleHomePath(changedUser.role))
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof MockAuthError
          ? err.message
          : 'Đổi mật khẩu thất bại. Vui lòng thử lại.'
      setServerError(message)
    }
  }

  if (isLoading || !isLoggedIn || !user?.mustChangePassword) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Đang kiểm tra phiên đăng nhập...</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm svtn-bento p-6">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Bảo mật tài khoản
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Đổi mật khẩu</h1>
          <p className="text-sm text-muted-foreground">Cập nhật mật khẩu trước khi tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!errors.currentPassword}
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive" role="alert">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive" role="alert">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive" role="alert">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && (
            <div
              className="rounded-2xl border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu mật khẩu'}
          </Button>
        </form>
      </div>
    </main>
  )
}
