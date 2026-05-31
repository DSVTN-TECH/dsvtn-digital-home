'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'
import { getShopDataSource, type Product } from '@/lib/datasource'
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
  const [related, setRelated] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading')
  const [quantity, setQuantity] = useState(1)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { cart, addToCart, updateQuantity, removeFromCart } = useShopCart()

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      const ds = getShopDataSource()
      const [found, products] = await Promise.all([ds.findProduct(productId), ds.listProducts()])
      if (!found) {
        setStatus('notfound')
        return
      }
      setProduct(found)
      setRelated(products.filter((item) => item.id !== found.id).slice(0, 4))
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Đường dẫn"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span aria-hidden="true">›</span>
          <Link href="/shop" className="hover:text-primary">
            Shop
          </Link>
          <span aria-hidden="true">›</span>
          <span className="text-foreground">Chi tiết</span>
        </nav>
        <Button variant={cartCount > 0 ? 'default' : 'outline'} onClick={() => setDrawerOpen(true)}>
          <ShoppingCart className="h-4 w-4" /> Giỏ hàng ({cartCount})
        </Button>
      </div>

      {status === 'loading' ? (
        <LoadingSkeleton className="lg:grid-cols-2" />
      ) : status === 'error' ? (
        <ErrorState onRetry={load} />
      ) : status === 'notfound' || !product ? (
        <EmptyState
          title="Không tìm thấy sản phẩm"
          description="Sản phẩm có thể đã ngừng bán hoặc không tồn tại."
        />
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
            <div className="space-y-4">
              <Card
                variant="bento"
                className="overflow-hidden bg-gradient-to-br from-[#eef5ff] to-white p-8"
              >
                <Image
                  src={product.imageUrl ?? '/assets/products/polo.svg'}
                  alt={product.name}
                  width={900}
                  height={900}
                  className="aspect-square w-full object-contain"
                  priority
                />
              </Card>
              <div className="grid grid-cols-4 gap-3">
                {[
                  product.imageUrl,
                  '/assets/products/polo.svg',
                  '/assets/products/cap.svg',
                  '/assets/products/tote.svg',
                ].map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="rounded-2xl border border-border bg-card p-3 shadow-sm"
                  >
                    <Image
                      src={src ?? '/assets/products/polo.svg'}
                      alt=""
                      width={180}
                      height={180}
                      className="aspect-square w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <header className="space-y-3">
                <Badge
                  tone={product.status === 'ACTIVE' ? 'success' : 'neutral'}
                  variant="outline"
                  className="border-transparent"
                >
                  {product.status === 'ACTIVE' ? 'Còn hàng' : 'Tạm dừng'}
                </Badge>
                <h1 className="text-h1 text-foreground">{product.name}</h1>
                <p className="text-3xl font-extrabold text-primary">
                  {formatPrice(product.priceCents)}
                </p>
              </header>

              {product.description ? (
                <p className="text-base leading-7 text-muted-foreground">{product.description}</p>
              ) : null}

              <Card variant="bento" className="p-5">
                <p className="text-sm font-semibold text-foreground">Số lượng</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-xl border border-border bg-card">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Giảm số lượng"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center text-sm font-bold">{quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Tăng số lượng"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="lg"
                    className="flex-1 sm:flex-none"
                    disabled={product.status !== 'ACTIVE'}
                    onClick={() => {
                      addToCart(product, quantity)
                      setDrawerOpen(true)
                    }}
                  >
                    {product.status === 'ACTIVE' ? 'Thêm vào giỏ' : 'Tạm hết hàng'}
                  </Button>
                </div>
              </Card>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['verified', 'Minh bạch', 'Ghi nhận đơn rõ ràng.'],
                  ['local_shipping', 'Hậu cần', 'Xác nhận sau thanh toán.'],
                  ['volunteer_activism', 'Gây quỹ', 'Hỗ trợ chiến dịch.'],
                ].map(([icon, title, desc]) => (
                  <Card key={title} className="p-4">
                    <span className="material-symbols-outlined text-primary" aria-hidden="true">
                      {icon}
                    </span>
                    <p className="mt-2 text-sm font-bold text-foreground">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{desc}</p>
                  </Card>
                ))}
              </div>

              <Card variant="bento" className="p-5">
                <div className="mb-4 flex gap-2 border-b border-border pb-3 text-sm font-semibold text-muted-foreground">
                  <span className="text-primary">Mô tả sản phẩm</span>
                  <span>Đóng góp</span>
                  <span>Chính sách</span>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  Doanh thu sau khi xác nhận đơn sẽ được tổng hợp vào trang gây quỹ công khai. Đội
                  logistic liên hệ để giao hàng sau khi minh chứng thanh toán hợp lệ.
                </p>
              </Card>
            </div>
          </div>

          {related.length > 0 ? (
            <section className="mt-14">
              <div className="svtn-section">
                <div>
                  <h2 className="text-h2">Sản phẩm liên quan</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Các lựa chọn khác trong shop gây quỹ.
                  </p>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((item) => (
                  <Link key={item.id} href={`/shop/${item.id}`} className="group block">
                    <Card variant="bento" interactive className="overflow-hidden p-0">
                      <div className="bg-gradient-to-br from-[#eef5ff] to-white p-5">
                        <Image
                          src={item.imageUrl ?? '/assets/products/polo.svg'}
                          alt={item.name}
                          width={400}
                          height={400}
                          className="aspect-square w-full object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {formatPrice(item.priceCents)}
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <CartDrawer
        open={drawerOpen}
        cart={cart}
        onClose={() => setDrawerOpen(false)}
        onCheckout={() => router.push('/shop/checkout')}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </div>
  )
}
