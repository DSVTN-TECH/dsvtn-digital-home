'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getShopDataSource, type CreateOrderResult, type Product } from '@/lib/datasource/shop'
import { OrderForm } from '@/components/forms/OrderForm'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { useShopCart } from '@/components/shop/useShopCart'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [orderResult, setOrderResult] = useState<CreateOrderResult | null>(null)
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useShopCart()

  useEffect(() => {
    getShopDataSource()
      .listProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('checkout') === '1') {
      setShowCheckout(true)
    }
  }, [])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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
              clearCart()
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
        <Button variant={cartCount > 0 ? 'default' : 'outline'} onClick={() => setDrawerOpen(true)}>
          Giỏ hàng ({cartCount})
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Đang tải sản phẩm...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có sản phẩm nào.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
              <Link href={`/shop/${product.id}`} className="text-base font-medium hover:underline">
                {product.name}
              </Link>
              {product.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
              <p className="mt-2 text-sm font-semibold">{formatPrice(product.priceCents)}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => addToCart(product)}>
                  Thêm vào giỏ
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/shop/${product.id}`}>Chi tiết</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CartDrawer
        open={drawerOpen}
        cart={cart}
        onClose={() => setDrawerOpen(false)}
        onCheckout={() => {
          setDrawerOpen(false)
          setShowCheckout(true)
        }}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </main>
  )
}
