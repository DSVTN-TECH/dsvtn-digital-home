import type { AuthUser, UserRole } from '@/types/api'

const STORAGE_KEY = 'dsvtn_mock_user'

interface MockAccount {
  password: string
  user: AuthUser
}

const accounts: Record<string, MockAccount> = {
  'admin@dsvtn.vn': {
    password: 'changeme',
    user: {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Admin ĐSVTN',
      email: 'admin@dsvtn.vn',
      role: 'ADMIN',
      mustChangePassword: false,
    },
  },
  'member1@dsvtn.vn': {
    password: 'member1',
    user: {
      id: '00000000-0000-0000-0000-000000000002',
      fullName: 'Nguyễn Thành Viên',
      email: 'member1@dsvtn.vn',
      role: 'MEMBER',
      mustChangePassword: false,
    },
  },
  'member2@dsvtn.vn': {
    password: 'member2',
    user: {
      id: '00000000-0000-0000-0000-000000000003',
      fullName: 'Trần Tình Nguyện',
      email: 'member2@dsvtn.vn',
      role: 'MEMBER',
      mustChangePassword: false,
    },
  },
  'logistic@dsvtn.vn': {
    password: 'logistic1',
    user: {
      id: '00000000-0000-0000-0000-000000000004',
      fullName: 'Lê Hậu Cần',
      email: 'logistic@dsvtn.vn',
      role: 'LOGISTIC',
      mustChangePassword: false,
    },
  },
}

export class MockAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'MockAuthError'
  }
}

function persist(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
}

export function mockLogin(email: string, password: string): AuthUser {
  const account = accounts[email.trim().toLowerCase()]
  if (!account || account.password !== password) {
    throw new MockAuthError('INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng (mock).')
  }
  persist(account.user)
  return account.user
}

export function mockMe(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function mockLogout(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function mockChangePassword(): AuthUser {
  const current = mockMe()
  if (!current) {
    throw new MockAuthError('UNAUTHENTICATED', 'Chưa đăng nhập (mock).')
  }
  const updated: AuthUser = { ...current, mustChangePassword: false }
  persist(updated)
  return updated
}

export function isMockRole(role: UserRole): boolean {
  return ['ADMIN', 'MEMBER', 'LOGISTIC'].includes(role)
}
