'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Trang chủ', exact: true },
  { href: '/news', label: 'Tin tức' },
  { href: '/shop', label: 'Shop' },
  { href: '/fundraising', label: 'Gây quỹ' },
  { href: '/volunteer', label: 'Đăng ký TNV' },
]

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  return exact ? pathname === href : pathname.startsWith(href)
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main-content" className="svtn-skip-link">
        Bỏ qua tới nội dung chính
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="ĐSVTN Digital Home — về trang chủ"
          >
            <Image
              src="/logo-dsvtn.png"
              alt="ĐSVTN Digital Home"
              width={44}
              height={44}
              className="h-11 w-11 object-contain"
              priority
            />
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-extrabold text-primary">ĐSVTN</span>
              <span className="text-xs font-medium text-muted-foreground">Digital Home</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng công khai">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn('svtn-nav-link--public', 'transition-colors')}
                  data-active={active}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/volunteer">Tham gia</Link>
            </Button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent md:hidden"
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <nav
            className="border-t border-border bg-white px-4 py-3 md:hidden"
            aria-label="Điều hướng di động"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      active
                        ? 'bg-[color:var(--primary-soft)] text-primary'
                        : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <div className="mt-2 flex gap-2 border-t border-border pt-3">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    Đăng nhập
                  </Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link href="/volunteer" onClick={() => setMobileOpen(false)}>
                    Tham gia
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
        ) : null}
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <PublicFooter />
    </div>
  )
}

function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <p className="text-sm font-extrabold text-primary">ĐSVTN Digital Home</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Nền tảng nội bộ và cổng công khai cho đội sinh viên tình nguyện: tuyển thành viên, quản
            lý hoạt động, phân công nhiệm vụ và vận hành shop gây quỹ.
          </p>
        </div>
        <div>
          <p className="text-label text-foreground">Khám phá</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/news" className="hover:text-primary">
                Tin tức
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-primary">
                Shop gây quỹ
              </Link>
            </li>
            <li>
              <Link href="/fundraising" className="hover:text-primary">
                Minh bạch tài chính
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-label text-foreground">Tham gia</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/volunteer" className="hover:text-primary">
                Đăng ký TNV
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-primary">
                Đăng nhập
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} ĐSVTN Digital Home. Nội bộ đội sinh viên tình nguyện.
        </p>
      </div>
    </footer>
  )
}
