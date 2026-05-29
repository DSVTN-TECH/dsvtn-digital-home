'use client'

import { useEffect, useState } from 'react'
import { getToken } from '@/lib/auth'
import type { AuthUser, UserRole } from '@/types/api'

function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      id: decoded.sub as string,
      email: decoded.email as string,
      role: decoded.role as UserRole,
      fullName: decoded.fullName as string,
    }
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      setUser(decodeJwtPayload(token))
    }
    setIsLoading(false)
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
