'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getNotificationsDataSource } from '@/lib/datasource'
import { NotificationBell } from './NotificationBell'

export function AdminTopBar() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    getNotificationsDataSource()
      .list(1, 1, false)
      .then((res) => setUnreadCount(res.unreadCount))
      .catch(() => setUnreadCount(0))
  }, [])

  return (
    <div className="flex h-14 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6">
      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <label htmlFor="admin-global-search" className="sr-only">
          Tìm kiếm nhanh
        </label>
        <input
          id="admin-global-search"
          type="search"
          placeholder="Tìm kiếm (sắp ra mắt)"
          className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          disabled
        />
      </div>

      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="sm" aria-label="Lịch hoạt động (sắp ra mắt)">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="sm" aria-label="Cài đặt (sắp ra mắt)">
          <Settings className="h-4 w-4" aria-hidden="true" />
        </Button>
        <NotificationBell href="/member/notifications" unreadCount={unreadCount} />
      </div>
    </div>
  )
}
