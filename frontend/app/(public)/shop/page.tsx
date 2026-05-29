'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getShopDataSource, type Product, type CreateOrderResult } from '@/lib/datasource/shop'
import { OrderForm, type CartItem } from '@/components/forms/OrderForm'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderResult, setOrderResult] = useState<CreateOrderResult | null>(null)

  useEffect(() => {
    getShopDataSource()
      .listProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: Math.max(1, quantity) } : i)),
    )
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  if (orderResult) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-md rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <h2 className="text-lg font-semibold text-green-800">Đặt hàng thành công!</h2>
          <p className="mt-2 text-sm text-green-700">Mã đơn hàng: {orderResult.id}</p>
          <p className="mt-1 text-sm text-green-700">Trạng thái: Chờ xác nhận thanh toán</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setOrderResult(null)
              setCart([])
              setShowCheckout(false)
            }}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      </main>
    )
  }

  if (showCheckout) {
    return (
      <main className="mx-auto max-w-lg px-4 py-12">
        <Button variant="ghost" size="sm" onClick={() => setShowCheckout(false)} className="mb-4">
          &larr; Quay lại
        </Button>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">Thanh toán</h1>
        <OrderForm
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onSuccess={setOrderResult}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Shop ĐSVTN</h1>
        {cart.length > 0 && (
          <Button onClick={() => setShowCheckout(true)}>
            Giỏ hàng ({cart.reduce((s, i) => s + i.quantity, 0)})
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <h2 className="text-base font-medium">{product.name}</h2>
              {product.description && (
                <p className="mt-1 text-sm text-muted-foreground">{product.description}</p>
              )}
              <p className="mt-2 text-sm font-semibold">{formatPrice(product.priceCents)}</p>
              <Button size="sm" className="mt-3 w-full" onClick={() => addToCart(product)}>
                Thêm vào giỏ
              </Button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

function formatPrice(cents: number): string {
  const vnd = Math.round(cents / 100)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vnd)
}
