import type { AuthUser } from '@/types/api'

export interface AuthDataSource {
  login(email: string, password: string): Promise<AuthUser>
  me(): Promise<AuthUser | null>
  logout(): Promise<void>
  changePassword(currentPassword: string, newPassword: string): Promise<AuthUser>
}
