import { INestApplication } from '@nestjs/common'
import request = require('supertest')
import type { Test as SupertestRequest } from 'supertest'

let clientIpCounter = 0

const E2E_RUN_ID_KEY = 'DSVTN_E2E_RUN_ID'

function e2eRunId(): string {
  const existing = process.env[E2E_RUN_ID_KEY]
  if (existing) return existing
  const created = `${process.pid}-${Date.now()}`
  process.env[E2E_RUN_ID_KEY] = created
  return created
}

function e2eCallsiteKey(): string {
  const stack = new Error().stack ?? ''
  return stack
    .split('\n')
    .find((line) => line.includes('.e2e-spec.ts'))
    ?.trim() ?? 'unknown-suite'
}

function hashText(value: string): string {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash.toString(36)
}

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
  clientIpCounter += 1
  const identity = hashText(`${e2eRunId()}:${process.env.JEST_WORKER_ID ?? '1'}:${e2eCallsiteKey()}:${clientIpCounter}`)
  return `e2e-${identity}`
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
