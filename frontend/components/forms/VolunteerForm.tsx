'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVolunteerSubmit } from '@/hooks/useVolunteerSubmit'

const volunteerSchema = z.object({
  fullName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^\d{9,11}$/, 'Số điện thoại phải 9-11 chữ số'),
  studentId: z.string().min(1, 'MSSV là bắt buộc').max(20),
  note: z.string().max(500).optional(),
})

type VolunteerFormValues = z.infer<typeof volunteerSchema>

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
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-green-800">Đăng ký thành công!</h2>
        <p className="mt-2 text-sm text-green-700">
          Đơn của bạn đã được ghi nhận (mã: {result.id}). Chúng tôi sẽ liên hệ sớm.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="fullName">Họ tên *</Label>
        <Input id="fullName" {...register('fullName')} aria-invalid={!!errors.fullName} />
        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Số điện thoại *</Label>
        <Input id="phone" {...register('phone')} aria-invalid={!!errors.phone} />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentId">MSSV *</Label>
        <Input id="studentId" {...register('studentId')} aria-invalid={!!errors.studentId} />
        {errors.studentId && <p className="text-sm text-destructive">{errors.studentId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
        <textarea
          id="note"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register('note')}
        />
        {errors.note && <p className="text-sm text-destructive">{errors.note.message}</p>}
      </div>

      {serverError && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
      </Button>
    </form>
  )
}
