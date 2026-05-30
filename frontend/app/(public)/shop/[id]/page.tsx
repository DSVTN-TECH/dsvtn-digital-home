'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/PageStates'
import { getShopDataSource, type Product } from '@/lib/datasource/shop'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { useShopCart } from '@/components/shop/useShopCart'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = params.id
  const [product, setProduct] = useState<Product | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading')
  const [quantity, setQuantity] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { cart, addToCart, updateQuantity, removeFromCart } = useShopCart()

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const found = await getShopDataSource().findProduct(productId)
      if (!found) {
        setStatus('notfound')
        return
      }
      setProduct(found)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }, [productId])

  useEffect(() => {
    void load()
  }, [load])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/shop">&larr; Tất cả sản phẩm</Link>
        </Button>
        <Button variant={cartCount > 0 ? 'default' : 'outline'} onClick={() => setDrawerOpen(true)}>
          Giỏ hàng ({cartCount})
        </Button>
      </div>

      {status === 'loading' ? (
        <LoadingState title="Đang tải sản phẩm..." />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : status === 'notfound' || !product ? (
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm có thể đã ngừng bán hoặc không tồn tại."
        />
      ) : (
        <article className="space-y-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-xl font-semibold text-primary">{formatPrice(product.priceCents)}</p>
          </header>

          {product.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          ) : null}

          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
            <div className="space-y-1">
              <Label htmlFor="detail-qty">Số lượng</Label>
              <Input
                id="detail-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                className="w-24"
              />
            </div>
            <Button
              onClick={() => {
                addToCart(product, quantity)
                setDrawerOpen(true)
              }}
            >
              Thêm vào giỏ
            </Button>
          </div>
        </article>
      )}

      <CartDrawer
        open={drawerOpen}
        cart={cart}
        onClose={() => setDrawerOpen(false)}
        onCheckout={() => router.push('/shop?checkout=1')}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </main>
  )
}
