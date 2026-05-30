import { NextFunction, Request, Response } from 'express'
import {
  ACCESS_COOKIE,
  CSRF_COOKIE,
  parseCookies,
  REFRESH_COOKIE,
} from '../../modules/auth/auth.cookies'

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function csrfMiddleware(request: Request, response: Response, next: NextFunction) {
  if (!unsafeMethods.has(request.method) || request.path === '/api/auth/login') {
    next()
    return
  }

  const cookies = parseCookies(request.headers.cookie)
  const usesCookieAuth =
    (!!cookies[ACCESS_COOKIE] || !!cookies[REFRESH_COOKIE]) && !request.headers.authorization
  if (!usesCookieAuth) {
    next()
    return
  }

  const csrfHeader = request.headers['x-csrf-token']
  const csrfToken = Array.isArray(csrfHeader) ? csrfHeader[0] : csrfHeader
  if (csrfToken && csrfToken === cookies[CSRF_COOKIE]) {
    next()
    return
  }

  response.status(403).json({
    timestamp: new Date().toISOString(),
    status: 403,
    error: 'Forbidden',
    message: 'CSRF token is invalid',
    code: 'CSRF_INVALID',
    path: request.originalUrl,
    requestId: '',
  })
}
