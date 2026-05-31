'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  href?: string
  className?: string
}

export function NotificationBell({
  href = '/member/notifications',
  className,
}: NotificationBellProps) {
  const unreadCount = useUnreadCount()
  const hasUnread = unreadCount > 0
  const label = hasUnread
    ? `Thông báo, ${unreadCount} chưa đọc`
    : 'Thông báo, không có thông báo mới'

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30',
        className,
      )}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {hasUnread ? (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-[18px] text-destructive-foreground"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}
