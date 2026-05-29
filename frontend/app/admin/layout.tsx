'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AdminNav } from '@/components/shared/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoggedIn, isLoading, isAdmin } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isLoggedIn) {
      router.replace('/login')
      return
    }
    if (!isAdmin) {
      router.replace('/')
    }
  }, [isLoading, isLoggedIn, isAdmin, router])

  if (isLoading || !isLoggedIn || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminNav user={user!} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
