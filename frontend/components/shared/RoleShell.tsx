'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/lib/auth'
import type { UserRole } from '@/types/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LoadingState } from './PageStates'
import { NotificationBell } from './NotificationBell'

export interface ShellNavItem {
  href: string
  label: string
  exact?: boolean
}

interface RoleShellProps {
  title: string
  navItems: ShellNavItem[]
  allow: UserRole[]
  showBell?: boolean
  notificationsHref?: string
  children: React.ReactNode
}

function isActive(pathname: string, item: ShellNavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href)
}

export function RoleShell({
  title,
  navItems,
  allow,
  showBell = false,
  notificationsHref,
  children,
}: RoleShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, isLoading } = useAuth()
  const isAllowed = !!user && allow.includes(user.role)

  useEffect(() => {
    if (isLoading) return
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }
    if (user?.mustChangePassword) {
      router.replace('/auth/change-password')
      return
    }
    if (!isAllowed) {
      router.replace('/')
    }
  }, [isLoading, isLoggedIn, isAllowed, user, router])

  if (isLoading || !isLoggedIn || user?.mustChangePassword || !isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState title="Đang tải..." className="border-none" />
      </div>
    )
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r bg-card p-4">
        <div className="mb-6">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label={title}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item) ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
                isActive(pathname, item) && 'bg-accent font-medium',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button variant="ghost" size="sm" className="mt-auto justify-start" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-2 border-b bg-background px-6">
          {showBell ? <NotificationBell href={notificationsHref} /> : null}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
