'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  href?: string
  unreadCount?: number
  className?: string
}

export function NotificationBell({
  href = '/member/notifications',
  unreadCount = 0,
  className,
}: NotificationBellProps) {
  const hasUnread = unreadCount > 0
  const label = hasUnread
    ? `Thông báo, ${unreadCount} chưa đọc`
    : 'Thông báo, không có thông báo mới'

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      {hasUnread ? (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}
