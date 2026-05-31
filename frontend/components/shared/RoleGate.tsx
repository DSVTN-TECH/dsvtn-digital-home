'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/api'
import { LoadingState } from './PageStates'

interface RoleGateProps {
  allow: UserRole[]
  children: React.ReactNode
}

export function RoleGate({ allow, children }: RoleGateProps) {
  const router = useRouter()
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState title="Đang tải..." className="border-none bg-transparent shadow-none" />
      </div>
    )
  }

  return <>{children}</>
}
