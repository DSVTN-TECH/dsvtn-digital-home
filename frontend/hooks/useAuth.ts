'use client'

import { useEffect, useState } from 'react'
import { getAuthDataSource } from '@/lib/datasource'
import type { AuthUser, UserRole } from '@/types/api'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getAuthDataSource()
      .me()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    isMember: user?.role === 'MEMBER',
    isLogistic: user?.role === 'LOGISTIC',
  }
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'MEMBER':
      return '/member/activities'
    case 'LOGISTIC':
      return '/logistic/orders'
  }
}

export function getPostLoginPath(user: AuthUser): string {
  return user.mustChangePassword ? '/auth/change-password' : getRoleHomePath(user.role)
}
