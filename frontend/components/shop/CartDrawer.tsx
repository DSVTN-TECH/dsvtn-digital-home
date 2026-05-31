'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import type { CartItem } from '@/components/forms/OrderForm'

interface CartDrawerProps {
  open: boolean
  cart: CartItem[]
  onClose: () => void
  onCheckout: () => void
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

export function CartDrawer({
  open,
  cart,
  onClose,
  onCheckout,
  onUpdateQuantity,
  onRemove,
}: CartDrawerProps) {
  const totalCents = cart.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="right"
      title="Giỏ hàng"
      description={itemCount > 0 ? `${itemCount} sản phẩm` : undefined}
      footer={
        cart.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatPrice(totalCents)}</span>
            </div>
            <Button type="button" className="w-full" onClick={onCheckout}>
              Thanh toán
            </Button>
          </div>
        ) : undefined
      }
    >
      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
          <span className="material-symbols-outlined text-4xl" aria-hidden="true">
            shopping_cart
          </span>
          <p>Giỏ hàng của bạn đang trống.</p>
          <Button variant="outline" size="sm" onClick={onClose} className="mt-2">
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {cart.map((item) => (
            <li
              key={item.product.id}
              className="rounded-2xl border border-border bg-background/60 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.product.priceCents)}
                  </p>
                </div>
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
              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center rounded-xl border border-border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Giảm số lượng"
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                    {item.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Tăng số lượng"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(item.product.priceCents * item.quantity)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  )
}
