'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const panelRef = useRef<HTMLDivElement>(null)
  const totalCents = cart.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40" role="presentation" onMouseDown={onClose}>
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Giỏ hàng"
        className="ml-auto flex h-full w-full max-w-md flex-col bg-background p-6 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Giỏ hàng</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Giỏ hàng đang trống.
          </div>
        ) : (
          <>
            <ul className="mt-4 flex-1 space-y-4 overflow-y-auto">
              {cart.map((item) => (
                <li key={item.product.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.product.priceCents)} / sản phẩm
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(item.product.id)}
                    >
                      Xoá
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Label htmlFor={`drawer-qty-${item.product.id}`} className="text-sm">
                      Số lượng
                    </Label>
                    <Input
                      id={`drawer-qty-${item.product.id}`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) =>
                        onUpdateQuantity(item.product.id, Number(event.target.value))
                      }
                      className="w-24"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Tổng cộng</span>
                <span>{formatPrice(totalCents)}</span>
              </div>
              <Button type="button" className="mt-4 w-full" onClick={onCheckout}>
                Thanh toán
              </Button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
