'use client'

import { useEffect, useState } from 'react'
import { getNotificationsDataSource } from '@/lib/datasource'

export function useUnreadCount(pollMs = 60000): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await getNotificationsDataSource().list(1, 1, false)
        if (!cancelled) setCount(res.unreadCount)
      } catch {
        if (!cancelled) setCount(0)
      }
    }

    void load()
    const id = window.setInterval(load, pollMs)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [pollMs])

  return count
}
