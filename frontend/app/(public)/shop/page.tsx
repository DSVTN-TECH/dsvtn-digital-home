'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState, ErrorState, LoadingSkeleton } from '@/components/shared/PageStates'
import { getShopDataSource, type Product } from '@/lib/datasource'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { useShopCart } from '@/components/shop/useShopCart'

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cents)
}

function campaignRaised(products: Product[]): number {
  return products.reduce((sum, product) => sum + product.priceCents, 0) * 42
}

export default function ShopPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { cart, addToCart, updateQuantity, removeFromCart } = useShopCart()

  function load() {
    setStatus('loading')
    getShopDataSource()
      .listProducts()
      .then((items) => {
        setProducts(items)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }

  useEffect(() => {
    load()
  }, [])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const raised = campaignRaised(products)
  const goal = 50000000
  const percent = Math.min(100, Math.round((raised / goal) * 100))

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-primary">
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary to-[color:var(--navy)] opacity-95"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[url('/assets/brand/hero.svg')] bg-cover bg-center opacity-20"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 text-primary-foreground sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-14">
          <div className="space-y-5">
            <nav
              aria-label="Đường dẫn"
              className="flex items-center gap-2 text-xs font-semibold text-primary-foreground/80"
            >
              <Link href="/" className="hover:text-primary-foreground">
                Trang chủ
              </Link>
              <span aria-hidden="true">›</span>
              <span className="text-primary-foreground">Shop</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/80">
              Shop gây quỹ
            </p>
            <h1 className="text-display max-w-3xl">Shop Gây Quỹ ĐSVTN 2026</h1>
            <p className="max-w-2xl text-base leading-7 text-primary-foreground/85">
              Mỗi đơn hàng được ghi nhận minh bạch và đóng góp trực tiếp cho chiến dịch Mùa Hè Xanh.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" asChild>
                <Link href="#products">Xem sản phẩm</Link>
              </Button>
              <Button
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-primary"
                onClick={() => setDrawerOpen(true)}
              >
                <ShoppingCart className="h-4 w-4" /> Giỏ hàng ({cartCount})
              </Button>
            </div>
          </div>
          <Card className="border-white/10 bg-white/10 p-5 text-primary-foreground shadow-none backdrop-blur">
            <p className="text-sm font-semibold text-primary-foreground/80">Mục tiêu chiến dịch</p>
            <div className="mt-4 rounded-3xl bg-white p-5 text-foreground">
              <p className="text-sm font-semibold text-muted-foreground">Mùa Hè Xanh 2026</p>
              <p className="mt-2 text-3xl font-extrabold text-primary">{formatPrice(raised)}</p>
              <p className="text-sm text-muted-foreground">/ {formatPrice(goal)}</p>
              <div
                className="mt-4 h-3 overflow-hidden rounded-full bg-muted"
                aria-label={`Đã đạt ${percent}% mục tiêu`}
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-2xl bg-muted p-2">
                  <dt className="text-muted-foreground">Đơn</dt>
                  <dd className="font-bold text-foreground">86</dd>
                </div>
                <div className="rounded-2xl bg-muted p-2">
                  <dt className="text-muted-foreground">TNV</dt>
                  <dd className="font-bold text-foreground">42</dd>
                </div>
                <div className="rounded-2xl bg-muted p-2">
                  <dt className="text-muted-foreground">Tiến độ</dt>
                  <dd className="font-bold text-foreground">{percent}%</dd>
                </div>
              </dl>
            </div>
          </Card>
        </div>
      </section>

      <div id="products" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="svtn-section">
          <div>
            <p className="svtn-eyebrow">Sản phẩm gây quỹ</p>
            <h2 className="text-h2">Danh mục sản phẩm</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Chọn sản phẩm yêu thích và thêm vào giỏ.
            </p>
          </div>
          <Button
            variant={cartCount > 0 ? 'default' : 'outline'}
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingCart className="h-4 w-4" /> Giỏ hàng ({cartCount})
          </Button>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {['Tất cả', 'Áo', 'Phụ kiện', 'Mới cập nhật'].map((item, index) => (
            <span key={item} className="svtn-chip" data-tone={index === 0 ? 'primary' : undefined}>
              {item}
            </span>
          ))}
        </div>

        {status === 'loading' ? (
          <LoadingSkeleton />
        ) : status === 'error' ? (
          <ErrorState onRetry={load} />
        ) : products.length === 0 ? (
          <EmptyState
            title="Chưa có sản phẩm"
            description="Shop gây quỹ sẽ sớm ra mắt sản phẩm mới."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} variant="bento" interactive className="overflow-hidden p-0">
                <Link
                  href={`/shop/${product.id}`}
                  className="block bg-gradient-to-br from-[#eef5ff] to-white p-8"
                >
                  <Image
                    src={product.imageUrl ?? '/assets/products/polo.svg'}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="aspect-square w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <Link
                      href={`/shop/${product.id}`}
                      className="text-base font-semibold text-foreground hover:text-primary"
                    >
                      {product.name}
                    </Link>
                    <Badge tone={product.status === 'ACTIVE' ? 'success' : 'neutral'}>
                      {product.status === 'ACTIVE' ? 'Đang bán' : 'Tạm dừng'}
                    </Badge>
                  </div>
                  {product.description ? (
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {product.description}
                    </p>
                  ) : null}
                  <p className="mt-4 text-xl font-extrabold text-primary">
                    {formatPrice(product.priceCents)}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      disabled={product.status !== 'ACTIVE'}
                      onClick={() => addToCart(product)}
                    >
                      Thêm vào giỏ
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/shop/${product.id}`}>Chi tiết</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CartDrawer
        open={drawerOpen}
        cart={cart}
        onClose={() => setDrawerOpen(false)}
        onCheckout={() => {
          setDrawerOpen(false)
          router.push('/shop/checkout')
        }}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
      />
    </>
  )
}
