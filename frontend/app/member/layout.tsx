'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MemberNav } from '@/components/shared/MemberNav'

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isLoggedIn, isLoading, isMember, isAdmin } = useAuth()

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
    if (!isMember && !isAdmin) {
      router.replace('/')
    }
  }, [isLoading, isLoggedIn, isMember, isAdmin, user, router])

  if (isLoading || !isLoggedIn || user?.mustChangePassword || (!isMember && !isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <MemberNav user={user!} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
