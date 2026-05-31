'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NotificationBell } from './NotificationBell'

export interface ShellNavItem {
  href: string
  label: string
  icon?: string
  exact?: boolean
}

interface MemberShellProps {
  title?: string
  navItems: ShellNavItem[]
  notificationsHref?: string
  children: React.ReactNode
}

function isActive(pathname: string, item: ShellNavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

export function MemberShell({
  title = 'ĐSVTN Member Zone',
  navItems,
  notificationsHref = '/member/notifications',
  children,
}: MemberShellProps) {
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

      <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-accent md:hidden"
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/member/feed" className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-primary">{title}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell href={notificationsHref} />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:inline-flex"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 sm:px-6 lg:px-8">
        <aside
          className={cn(
            'fixed inset-y-16 left-0 z-30 w-72 max-w-[80vw] flex-shrink-0 border-r border-border bg-card p-4 transition-transform md:sticky md:inset-auto md:top-20 md:z-10 md:h-[calc(100vh-5rem)] md:w-60 md:translate-x-0 md:rounded-2xl md:border md:bg-card md:p-3',
            mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          )}
        >
          <nav aria-label="Điều hướng thành viên" className="flex h-full flex-col">
            <div className="mb-3 px-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.fullName ?? 'Thành viên'}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <ul className="flex flex-1 flex-col gap-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isActive(pathname, item)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                      className="svtn-nav-link svtn-nav-link--member"
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
            <Button
              variant="ghost"
              className="mt-3 h-10 justify-start rounded-xl sm:hidden"
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
          </nav>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            aria-label="Đóng menu"
            className="fixed inset-0 top-16 z-20 bg-[color:var(--overlay)] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <main id="main-content" className="min-w-0 flex-1 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
