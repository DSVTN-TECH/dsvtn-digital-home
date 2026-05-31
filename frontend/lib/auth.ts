import { mockLogout } from './mock/auth'

const CSRF_COOKIE = 'dsvtn_csrf'

export function getCsrfToken(): string | null {
  if (typeof window === 'undefined') return null
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE}=`))
  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null
}

export async function logout(): Promise<void> {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== 'api') {
    mockLogout()
    return
  }

  const csrfToken = getCsrfToken()
  await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
  }).catch(() => undefined)
}
