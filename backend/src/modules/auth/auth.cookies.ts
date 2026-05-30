import { randomBytes } from 'crypto'
import { Request, Response } from 'express'

export const ACCESS_COOKIE = 'dsvtn_access'
export const REFRESH_COOKIE = 'dsvtn_refresh'
export const CSRF_COOKIE = 'dsvtn_csrf'

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [rawName, ...rawValue] = part.trim().split('=')
    if (!rawName) return acc
    acc[rawName] = decodeURIComponent(rawValue.join('='))
    return acc
  }, {})
}

function isSecureCookie() {
  return process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production'
}

export function newCsrfToken() {
  return randomBytes(32).toString('hex')
}

export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
  csrfToken: string,
) {
  const secure = isSecureCookie()
  response.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: ACCESS_MAX_AGE_MS,
    path: '/',
  })
  response.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/',
  })
  response.cookie(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure,
    maxAge: REFRESH_MAX_AGE_MS,
    path: '/',
  })
}

export function clearAuthCookies(response: Response) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE]) {
    response.clearCookie(name, { path: '/' })
  }
}

export function getCookieFromRequest(request: Request, name: string) {
  return parseCookies(request.headers.cookie)[name]
}
