'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getInvitesDataSource } from '@/lib/datasource/invites'

const acceptSchema = z.object({
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
})

type AcceptForm = z.infer<typeof acceptSchema>

function AcceptInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [serverError, setServerError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptForm>({ resolver: zodResolver(acceptSchema) })

  async function onSubmit(values: AcceptForm) {
    setServerError(null)
    try {
      await getInvitesDataSource().accept({ token, ...values })
      setDone(true)
      setTimeout(() => router.push('/login'), 1500)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Chấp nhận lời mời thất bại')
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-destructive" role="alert">
        Liên kết lời mời không hợp lệ hoặc thiếu token.
      </p>
    )
  }

  if (done) {
    return (
      <p className="text-sm text-green-700" role="status">
        Tài khoản đã được kích hoạt. Đang chuyển tới trang đăng nhập...
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="fullName">Họ tên</Label>
        <Input id="fullName" {...register('fullName')} />
        {errors.fullName ? (
          <p className="text-xs text-destructive" role="alert">
            {errors.fullName.message}
          </p>
        ) : null}
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password ? (
          <p className="text-xs text-destructive" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      {serverError ? (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Đang xử lý...' : 'Kích hoạt tài khoản'}
      </Button>
    </form>
  )
}

export default function InviteAcceptPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Chấp nhận lời mời</h1>
          <p className="text-sm text-muted-foreground">
            Hoàn tất thông tin để kích hoạt tài khoản ĐSVTN của bạn.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải...</p>}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </main>
  )
}
