import { apiFetch } from '@/lib/api'
import { getCsrfToken } from '@/lib/auth'
import type { AuthUser, LoginResponse } from '@/types/api'
import type { AuthDataSource } from './auth.datasource'

export class ApiAuthDataSource implements AuthDataSource {
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    return res.user
  }

  async me(): Promise<AuthUser | null> {
    try {
      const res = await apiFetch<{ user: AuthUser }>('/auth/me')
      return res.user
    } catch {
      return null
    }
  }

  async logout(): Promise<void> {
    const csrfToken = getCsrfToken()
    await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
    }).catch(() => undefined)
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<AuthUser> {
    const res = await apiFetch<LoginResponse>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    return res.user
  }
}
