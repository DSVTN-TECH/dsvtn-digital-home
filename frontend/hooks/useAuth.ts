'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import type { AuthUser, UserRole } from '@/types/api'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiFetch<{ user: AuthUser }>('/auth/me')
      .then((response) => {
        if (!cancelled) setUser(response.user)
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
