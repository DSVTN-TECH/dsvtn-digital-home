'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getShopDataSource, type CreateOrderResult, type Product } from '@/lib/datasource/shop'

export interface CartItem {
  product: Product
  quantity: number
}

const orderSchema = z.object({
  customerName: z.string().min(1, 'Họ tên là bắt buộc').max(100),
  customerPhone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc')
    .regex(/^\d{9,11}$/, 'Số điện thoại phải 9-11 chữ số'),
  customerAddress: z.string().min(1, 'Địa chỉ là bắt buộc').max(255),
  paymentProofUrl: z
    .string()
    .min(1, 'Link xác nhận chuyển khoản là bắt buộc')
    .url('Link không hợp lệ')
    .refine((v) => v.startsWith('https://'), 'Link phải bắt đầu bằng https://'),
})

type OrderFormValues = z.infer<typeof orderSchema>

interface OrderFormProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  onSuccess: (result: CreateOrderResult) => void
}

export function OrderForm({ cart, onUpdateQuantity, onRemove, onSuccess }: OrderFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const totalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0),
    [cart],
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({ resolver: zodResolver(orderSchema) })

  async function onSubmit(values: OrderFormValues) {
    if (cart.length === 0) {
      setServerError('Giỏ hàng đang trống')
      return
    }
    setServerError(null)
    setSubmitting(true)
    try {
      const ds = getShopDataSource()
      const result = await ds.createOrder({
        ...values,
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
      })
      onSuccess(result)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Đặt hàng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <section className="rounded-md border bg-card p-4">
        <h3 className="text-base font-semibold">Giỏ hàng</h3>
        {cart.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Chưa có sản phẩm nào. Quay lại danh sách để thêm vào giỏ.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {cart.map((item) => (
              <li
                key={item.product.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(item.product.priceCents)} / sản phẩm
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`qty-${item.product.id}`} className="sr-only">
                    Số lượng
                  </Label>
                  <Input
                    id={`qty-${item.product.id}`}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const next = Number.parseInt(e.target.value, 10)
                      onUpdateQuantity(item.product.id, Number.isFinite(next) ? next : 1)
                    }}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.product.id)}
                  >
                    Xoá
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm font-semibold">
          <span>Tổng cộng</span>
          <span>{formatPrice(totalCents)}</span>
        </div>
      </section>

      <section className="space-y-4 rounded-md border bg-card p-4">
        <h3 className="text-base font-semibold">Thông tin giao hàng</h3>

        <div className="space-y-2">
          <Label htmlFor="customerName">Họ tên *</Label>
          <Input
            id="customerName"
            {...register('customerName')}
            aria-invalid={!!errors.customerName}
          />
          {errors.customerName && (
            <p className="text-sm text-destructive">{errors.customerName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone">Số điện thoại *</Label>
          <Input
            id="customerPhone"
            {...register('customerPhone')}
            aria-invalid={!!errors.customerPhone}
          />
          {errors.customerPhone && (
            <p className="text-sm text-destructive">{errors.customerPhone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerAddress">Địa chỉ *</Label>
          <Input
            id="customerAddress"
            {...register('customerAddress')}
            aria-invalid={!!errors.customerAddress}
          />
          {errors.customerAddress && (
            <p className="text-sm text-destructive">{errors.customerAddress.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentProofUrl">Link ảnh xác nhận chuyển khoản (https) *</Label>
          <Input
            id="paymentProofUrl"
            placeholder="https://..."
            {...register('paymentProofUrl')}
            aria-invalid={!!errors.paymentProofUrl}
          />
          {errors.paymentProofUrl && (
            <p className="text-sm text-destructive">{errors.paymentProofUrl.message}</p>
          )}
        </div>
      </section>

      {serverError && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={submitting || cart.length === 0}>
        {submitting ? 'Đang gửi...' : 'Đặt hàng'}
      </Button>
    </form>
  )
}

function formatPrice(cents: number): string {
  const vnd = Math.round(cents / 100)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vnd)
}
