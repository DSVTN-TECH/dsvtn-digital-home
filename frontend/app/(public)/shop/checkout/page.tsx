'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { OrderForm } from '@/components/forms/OrderForm'
import { useShopCart } from '@/components/shop/useShopCart'
import type { CreateOrderResult } from '@/lib/datasource'

const checkoutSteps = ['Giỏ hàng', 'Thông tin & Thanh toán', 'Hoàn tất']

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, clearCart } = useShopCart()
  const [orderResult, setOrderResult] = useState<CreateOrderResult | null>(null)

  if (orderResult) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <span
          className="material-symbols-outlined rounded-full bg-[color:var(--success)]/10 p-4 text-4xl text-[color:var(--success)]"
          aria-hidden="true"
        >
          task_alt
        </span>
        <h1 className="mt-6 text-h2 text-foreground">Đặt hàng thành công!</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Mã đơn hàng <strong>{orderResult.id}</strong>. Trạng thái: chờ xác nhận thanh toán. Đội
          ngũ hậu cần sẽ kiểm tra minh chứng và liên hệ với bạn.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/shop" onClick={() => clearCart()}>
              Tiếp tục mua sắm
            </Link>
          </Button>
          <Button asChild>
            <Link href="/fundraising">Xem tiến độ gây quỹ</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <Card variant="bento" className="p-10">
          <span
            className="material-symbols-outlined text-4xl text-muted-foreground"
            aria-hidden="true"
          >
            shopping_cart
          </span>
          <h1 className="mt-4 text-h3 text-foreground">Giỏ hàng đang trống</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hãy chọn sản phẩm trong shop gây quỹ trước khi thanh toán.
          </p>
          <Button asChild className="mt-6">
            <Link href="/shop">Tới shop gây quỹ</Link>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Button variant="ghost" size="sm" onClick={() => router.push('/shop')} className="mb-4">
        <ArrowLeft className="h-4 w-4" /> Quay lại shop
      </Button>
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="svtn-eyebrow">Shop gây quỹ</p>
          <h1 className="mt-2 text-h1">Thanh toán</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Điền thông tin giao hàng, chuyển khoản theo hướng dẫn và gửi minh chứng để logistic xác
            nhận.
          </p>
        </div>
        <Card
          variant="bento"
          className="grid grid-cols-3 gap-2 p-3 text-center text-xs font-semibold text-muted-foreground"
        >
          {checkoutSteps.map((step, index) => (
            <div
              key={step}
              className={
                index === 1
                  ? 'rounded-2xl bg-[color:var(--primary-soft)] px-2 py-3 text-primary'
                  : 'rounded-2xl bg-muted px-2 py-3'
              }
            >
              <span className="block text-sm font-extrabold">0{index + 1}</span>
              {step}
            </div>
          ))}
        </Card>
      </div>
      <OrderForm
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onSuccess={setOrderResult}
      />
    </div>
  )
}
