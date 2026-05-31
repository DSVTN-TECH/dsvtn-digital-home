'use client'

import { CalendarDays, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NotificationBell } from './NotificationBell'

interface AdminTopBarProps {
  title?: string
  description?: string
  actions?: React.ReactNode
  searchSlot?: React.ReactNode
  className?: string
}

export function AdminTopBar({
  title,
  description,
  actions,
  searchSlot,
  className,
}: AdminTopBarProps) {
  return (
    <div className={cn('flex w-full items-center gap-3 py-3', className)}>
      {title ? (
        <div className="hidden min-w-0 flex-1 lg:block">
          <h1 className="truncate text-h3 text-[color:var(--navy)]">{title}</h1>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : (
        <div className="hidden min-w-0 flex-1 lg:block" />
      )}

      <div className="hidden min-w-0 flex-1 sm:flex sm:max-w-xs lg:max-w-md">
        {searchSlot ?? (
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="admin-global-search" className="sr-only">
              Tìm kiếm nhanh
            </label>
            <input
              id="admin-global-search"
              type="search"
              placeholder="Tìm kiếm (sắp ra mắt)"
              className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
              disabled
            />
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label="Lịch hoạt động (sắp ra mắt)"
          disabled
        >
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label="Cài đặt (sắp ra mắt)"
          disabled
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </Button>
        <NotificationBell href="/member/notifications" />
        {actions ? <div className="ml-2 flex items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
