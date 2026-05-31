'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ShellNavItem {
  href: string
  label: string
  icon?: string
  exact?: boolean
}

interface AdminShellProps {
  title: string
  navItems: ShellNavItem[]
  brand?: string
  topBar?: React.ReactNode
  children: React.ReactNode
}

function isActive(pathname: string, item: ShellNavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

export function AdminShell({
  title,
  navItems,
  brand = 'ĐSVTN Admin Zone',
  topBar,
  children,
}: AdminShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="svtn-skip-link">
        Bỏ qua tới nội dung chính
      </a>

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-[var(--svtn-sidebar)] flex-col border-r border-border bg-card transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="text-h3 text-[color:var(--navy)]">{brand}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Admin Zone</p>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Đóng menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label={title}>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn('svtn-nav-link svtn-nav-link--admin')}
                    data-active={active}
                  >
                    {item.icon ? (
                      <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                        {item.icon}
                      </span>
                    ) : null}
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-3 py-4">
          <div className="mb-2 px-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.fullName ?? 'Quản trị viên'}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl"
            onClick={handleLogout}
          >
            Đăng xuất
          </Button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-[color:var(--overlay)] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-col lg:pl-[var(--svtn-sidebar)]">
        <div
          className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-white/85 px-4 backdrop-blur-md lg:px-8"
          style={{ minHeight: 'var(--svtn-topbar)' }}
        >
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Mở menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">{topBar}</div>
        </div>

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
