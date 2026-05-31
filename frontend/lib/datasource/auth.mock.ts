import type { AuthUser } from '@/types/api'
import { mockChangePassword, mockLogin, mockLogout, mockMe } from '@/lib/mock/auth'
import type { AuthDataSource } from './auth.datasource'

export class MockAuthDataSource implements AuthDataSource {
  async login(email: string, password: string): Promise<AuthUser> {
    return mockLogin(email, password)
  }

  async me(): Promise<AuthUser | null> {
    return mockMe()
  }

  async logout(): Promise<void> {
    mockLogout()
  }

  async changePassword(): Promise<AuthUser> {
    return mockChangePassword()
  }
}
