'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import type { AuthUser } from '@/types/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
]

interface AdminNavProps {
  user: AuthUser
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    clearToken()
    router.push('/login')
  }

  return (
    <aside className="flex w-56 flex-col border-r bg-card p-4">
      <div className="mb-6">
        <p className="text-sm font-semibold">ĐSVTN Admin</p>
        <p className="text-xs text-muted-foreground">{user.email}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent',
              pathname === item.href && 'bg-accent font-medium',
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
  )
}
