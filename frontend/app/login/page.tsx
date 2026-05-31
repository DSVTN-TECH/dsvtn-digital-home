'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { getAuthDataSource, MockAuthError } from '@/lib/datasource'
import { getPostLoginPath, useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'

const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { user, isLoggedIn, isLoading } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      router.replace(getPostLoginPath(user))
    }
  }, [isLoading, isLoggedIn, user, router])

  async function onSubmit(values: LoginForm) {
    setServerError(null)
    try {
      const u = await getAuthDataSource().login(values.email, values.password)
      router.push(getPostLoginPath(u))
    } catch (err) {
      const message =
        err instanceof ApiError || err instanceof MockAuthError
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.'
      setServerError(message)
    }
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: "url('/assets/brand/hero.svg')" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[color:var(--navy)] opacity-90"
          aria-hidden="true"
        />
        <div className="relative">
          <Link
            href="/"
            aria-label="Về trang chủ"
            className="inline-flex items-center gap-2 text-primary-foreground"
          >
            <Image
              src="/logo-dsvtn.png"
              alt="ĐSVTN"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl bg-white/10 p-1.5"
            />
            <div>
              <p className="text-sm font-extrabold tracking-tight">ĐSVTN Digital Home</p>
              <p className="text-xs text-primary-foreground/70">Cổng quản trị và thành viên</p>
            </div>
          </Link>
        </div>
        <div className="relative space-y-6 text-primary-foreground">
          <h2 className="text-display">Chào mừng trở lại.</h2>
          <p className="max-w-md text-base leading-7 text-primary-foreground/85">
            Đăng nhập để quản lý hoạt động, phân công tình nguyện viên, theo dõi tiến độ gây quỹ và
            điều hành đội ngũ ĐSVTN.
          </p>
          <ul className="grid max-w-md gap-3 text-sm text-primary-foreground/85">
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-[20px]" aria-hidden="true">
                verified
              </span>
              <span>Bảo mật cookie HttpOnly + CSRF, không lưu token trong trình duyệt.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-[20px]" aria-hidden="true">
                groups
              </span>
              <span>Phân quyền theo vai trò Admin · Member · Logistic.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="material-symbols-outlined mt-0.5 text-[20px]" aria-hidden="true">
                insights
              </span>
              <span>Báo cáo, gây quỹ và recap đồng bộ thời gian thực.</span>
            </li>
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} ĐSVTN Digital Home
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" aria-label="Về trang chủ">
              <Image
                src="/logo-dsvtn.png"
                alt="ĐSVTN"
                width={64}
                height={64}
                className="mx-auto h-16 w-16"
                priority
              />
            </Link>
          </div>
          <div className="mb-6 space-y-2">
            <span className="inline-flex items-center rounded-full bg-[color:var(--primary-soft)] px-3 py-1 text-xs font-semibold text-primary">
              Cổng thành viên
            </span>
            <h1 className="text-h1">Đăng nhập</h1>
            <p className="text-sm text-muted-foreground">
              Sử dụng email được cấp để truy cập khu vực thành viên hoặc quản trị.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="ten@dsvtn.vn"
                invalid={!!errors.email}
                {...register('email')}
              />
            </FormField>

            <FormField
              label="Mật khẩu"
              htmlFor="password"
              required
              error={errors.password?.message}
            >
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  invalid={!!errors.password}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <div className="flex items-center justify-between text-sm">
              <Link href="/" className="text-muted-foreground hover:text-primary">
                Về trang chủ
              </Link>
              <Link
                href="#"
                className="font-semibold text-primary hover:underline"
                aria-disabled="true"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {serverError ? (
              <div
                className="rounded-2xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                role="alert"
              >
                {serverError}
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </form>

          <p className="mt-6 rounded-2xl border border-border bg-card px-4 py-3 text-xs leading-5 text-muted-foreground">
            Tài khoản demo: <strong>admin@dsvtn.vn / changeme</strong>,{' '}
            <strong>member1@dsvtn.vn / member1</strong>,{' '}
            <strong>logistic@dsvtn.vn / logistic1</strong>.
          </p>
        </div>
      </section>
    </main>
  )
}
