'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/ui/form-field'
import { getShopDataSource, type CreateOrderResult, type Product } from '@/lib/datasource'

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

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]"
      noValidate
    >
      <div className="space-y-6">
        <Card variant="bento" className="p-0">
          <CardHeader>
            <CardTitle>Thông tin giao hàng</CardTitle>
            <CardDescription>
              Đội logistics dùng thông tin này để xác nhận và giao sản phẩm.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Họ và tên"
              htmlFor="customerName"
              required
              error={errors.customerName?.message}
            >
              <Input
                id="customerName"
                autoComplete="name"
                invalid={!!errors.customerName}
                {...register('customerName')}
              />
            </FormField>
            <FormField
              label="Số điện thoại"
              htmlFor="customerPhone"
              required
              error={errors.customerPhone?.message}
            >
              <Input
                id="customerPhone"
                inputMode="tel"
                autoComplete="tel"
                invalid={!!errors.customerPhone}
                {...register('customerPhone')}
              />
            </FormField>
            <FormField
              label="Địa chỉ nhận hàng"
              htmlFor="customerAddress"
              required
              error={errors.customerAddress?.message}
              className="sm:col-span-2"
            >
              <Input
                id="customerAddress"
                autoComplete="street-address"
                invalid={!!errors.customerAddress}
                {...register('customerAddress')}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card variant="bento" className="p-0">
          <CardHeader>
            <CardTitle>Minh chứng thanh toán</CardTitle>
            <CardDescription>Chuyển khoản và dán link ảnh biên lai công khai.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="rounded-3xl border border-border bg-muted p-4 text-center">
              <div
                className="mx-auto grid h-32 w-32 grid-cols-5 gap-1 rounded-2xl bg-white p-3 shadow-sm"
                aria-hidden="true"
              >
                {Array.from({ length: 25 }).map((_, index) => (
                  <span
                    key={index}
                    className={
                      index % 3 === 0 || index % 7 === 0
                        ? 'rounded-sm bg-foreground'
                        : 'rounded-sm bg-muted'
                    }
                  />
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Vietcombank
              </p>
              <p className="mt-1 text-sm font-extrabold text-foreground">1234 5678 9012</p>
              <p className="text-xs text-muted-foreground">ĐSVTN Shop</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-[color:var(--info)]/30 bg-[color:var(--info)]/10 p-4 text-sm text-foreground">
                <p className="font-semibold">Hướng dẫn</p>
                <p className="mt-1 leading-6 text-muted-foreground">
                  Nội dung chuyển khoản: họ tên + số điện thoại. Sau khi upload biên lai lên Drive
                  hoặc Imgur, dán link <strong>https</strong> vào ô bên dưới.
                </p>
              </div>
              <FormField
                label="Link ảnh xác nhận chuyển khoản"
                htmlFor="paymentProofUrl"
                required
                help="Liên kết phải bắt đầu bằng https:// và xem được công khai."
                error={errors.paymentProofUrl?.message}
              >
                <Input
                  id="paymentProofUrl"
                  placeholder="https://..."
                  invalid={!!errors.paymentProofUrl}
                  {...register('paymentProofUrl')}
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card variant="bento" className="p-0">
          <CardHeader>
            <CardTitle>Đơn hàng ({cart.length} sản phẩm)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Chưa có sản phẩm nào. Quay lại shop để thêm vào giỏ.
              </p>
            ) : (
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="h-14 w-14 flex-shrink-0 rounded-2xl bg-muted p-2">
                        <Image
                          src={item.product.imageUrl ?? '/assets/products/polo.svg'}
                          alt=""
                          width={80}
                          height={80}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.product.priceCents)}
                        </p>
                        <div className="mt-2 inline-flex items-center rounded-lg border border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Giảm"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                            }
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="w-8 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label="Tăng"
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        {formatPrice(item.product.priceCents * item.quantity)}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Xoá ${item.product.name}`}
                        onClick={() => onRemove(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center justify-between border-t border-border pt-3 text-base font-bold">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatPrice(totalCents)}</span>
            </div>
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

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || cart.length === 0}
        >
          {submitting ? 'Đang gửi...' : 'Xác nhận đặt hàng'}
        </Button>
      </div>
    </form>
  )
}
