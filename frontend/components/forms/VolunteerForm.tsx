'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { useVolunteerSubmit } from '@/hooks/useVolunteerSubmit'

const volunteerSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^\d{9,11}$/, 'Số điện thoại phải 9-11 chữ số'),
  studentId: z.string().min(1, 'MSSV là bắt buộc').max(20),
  faculty: z.string().max(120).optional(),
  hearAbout: z.string().max(50).optional(),
  preferred: z.string().max(120).optional(),
  note: z.string().max(500).optional(),
})

type VolunteerFormValues = z.infer<typeof volunteerSchema>

const hearOptions = [
  { value: '', label: '— Chọn —' },
  { value: 'social', label: 'Mạng xã hội' },
  { value: 'friend', label: 'Bạn bè giới thiệu' },
  { value: 'school', label: 'Thông báo từ trường' },
  { value: 'other', label: 'Khác' },
]

const preferredOptions = [
  { value: '', label: '— Chọn lĩnh vực mong muốn —' },
  { value: 'teach', label: 'Dạy học cộng đồng' },
  { value: 'logistics', label: 'Hậu cần' },
  { value: 'comms', label: 'Truyền thông' },
  { value: 'health', label: 'Y tế / Sơ cấp cứu' },
  { value: 'support', label: 'Hỗ trợ chung' },
]

export function VolunteerForm() {
  const { submit, result, error: serverError, loading } = useVolunteerSubmit()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VolunteerFormValues>({ resolver: zodResolver(volunteerSchema) })

  async function onSubmit(values: VolunteerFormValues) {
    await submit(values)
  }

  if (result) {
    return (
      <Card
        variant="bento"
        className="border border-[color:var(--success)]/30 bg-[color:var(--success)]/10 p-8 text-center"
      >
        <p className="svtn-eyebrow text-[color:var(--success)]">Đã ghi nhận</p>
        <h2 className="mt-2 text-h2 text-foreground">Đăng ký thành công!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Đơn của bạn đã được ghi nhận với mã <strong>{result.id}</strong>. Đội ĐSVTN sẽ liên hệ
          trong vài ngày tới.
        </p>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card variant="bento">
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Dùng để liên hệ và xác nhận. Vui lòng điền chính xác.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Họ và tên" htmlFor="fullName" required error={errors.fullName?.message}>
            <Input
              id="fullName"
              autoComplete="name"
              invalid={!!errors.fullName}
              {...register('fullName')}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              invalid={!!errors.email}
              {...register('email')}
            />
          </FormField>
          <FormField label="Số điện thoại" htmlFor="phone" required error={errors.phone?.message}>
            <Input
              id="phone"
              inputMode="tel"
              autoComplete="tel"
              invalid={!!errors.phone}
              {...register('phone')}
            />
          </FormField>
          <FormField
            label="Mã số sinh viên"
            htmlFor="studentId"
            required
            error={errors.studentId?.message}
          >
            <Input id="studentId" invalid={!!errors.studentId} {...register('studentId')} />
          </FormField>
          <FormField label="Khoa / Trường" htmlFor="faculty" error={errors.faculty?.message}>
            <Input id="faculty" autoComplete="organization" {...register('faculty')} />
          </FormField>
        </CardContent>
      </Card>

      <Card variant="bento">
        <CardHeader>
          <CardTitle>Bạn biết tới ĐSVTN qua đâu?</CardTitle>
          <CardDescription>
            Giúp chúng tôi cải thiện cách lan toả tới các bạn sinh viên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField label="Nguồn biết tới" htmlFor="hearAbout">
            <Select id="hearAbout" {...register('hearAbout')}>
              {hearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card variant="bento">
        <CardHeader>
          <CardTitle>Hoạt động & nguyện vọng</CardTitle>
          <CardDescription>Cho chúng tôi biết bạn quan tâm tới mảng nào nhất.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField label="Lĩnh vực mong muốn" htmlFor="preferred">
            <Select id="preferred" {...register('preferred')}>
              {preferredOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            label="Ghi chú thêm"
            htmlFor="note"
            help="Tối đa 500 ký tự."
            error={errors.note?.message}
          >
            <textarea
              id="note"
              rows={4}
              aria-invalid={errors.note ? true : undefined}
              className="flex min-h-[112px] w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
              {...register('note')}
            />
          </FormField>
        </CardContent>
      </Card>

      {serverError ? (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Bằng việc gửi đơn, bạn đồng ý cho ĐSVTN sử dụng thông tin để liên hệ và phục vụ hoạt động
          tình nguyện.
        </p>
        <Button type="submit" size="lg" disabled={loading} className="sm:min-w-44">
          {loading ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
        </Button>
      </div>
    </form>
  )
}
