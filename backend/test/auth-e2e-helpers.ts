import { INestApplication } from '@nestjs/common'
import request = require('supertest')
import type { Test as SupertestRequest } from 'supertest'

let clientIpCounter = 0

export interface AuthSession {
  cookies: string[]
  csrfToken: string
}

export function sessionFromResponse(res: request.Response): AuthSession {
  const cookies = (res.headers['set-cookie'] as unknown as string[]).map((cookie) =>
    cookie.split(';')[0],
  )
  const csrfToken =
    cookies
      .find((cookie) => cookie.startsWith('dsvtn_csrf='))
      ?.split('=')
      .slice(1)
      .join('=') ?? ''
  return { cookies, csrfToken }
}

export async function loginSession(
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthSession> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .set('X-Forwarded-For', e2eClientIp())
    .send({ email, password })
    .expect(200)
  return sessionFromResponse(res)
}

export function e2eClientIp(): string {
  const worker = Number(process.env.JEST_WORKER_ID ?? '1')
  clientIpCounter += 1
  const block = Math.floor(clientIpCounter / 250) + 1
  const host = (clientIpCounter % 250) + 1
  return `198.51.${worker * 10 + block}.${host}`
}

export async function loginAndChangePassword(
  app: INestApplication,
  email: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthSession> {
  const session = await loginSession(app, email, currentPassword)
  const res = await withAuth(
    request(app.getHttpServer()).post('/api/auth/change-password'),
    session,
    true,
  )
    .send({ currentPassword, newPassword })
    .expect(200)
  return sessionFromResponse(res)
}

export function withAuth<T extends SupertestRequest>(
  test: T,
  session: AuthSession,
  csrf = false,
): T {
  const req = test.set('Cookie', session.cookies)
  if (csrf) req.set('X-CSRF-Token', session.csrfToken)
  return req
}
