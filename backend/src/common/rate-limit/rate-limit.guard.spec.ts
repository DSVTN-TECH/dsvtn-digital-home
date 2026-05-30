import { ExecutionContext, HttpException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { RedisService } from '../redis'
import { RateLimitGuard } from './rate-limit.guard'
import { RateLimitOptions } from './rate-limit.decorator'

function makeContext(ip = '1.2.3.4', user?: { id: string }): ExecutionContext {
  const request = { headers: {}, ip, socket: { remoteAddress: ip }, user }
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext
}

function buildGuard(opts: {
  options: RateLimitOptions | undefined
  incrResults?: (number | null)[]
  enabled?: string
}) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(opts.options),
  } as unknown as Reflector
  let call = 0
  const redis = {
    incrWithTtl: jest.fn().mockImplementation(() => {
      const results = opts.incrResults ?? [1]
      const value = results[Math.min(call, results.length - 1)]
      call += 1
      return Promise.resolve(value)
    }),
  } as unknown as RedisService
  const config = {
    get: jest.fn().mockReturnValue(opts.enabled ?? 'true'),
  } as unknown as ConfigService
  return new RateLimitGuard(reflector, redis, config)
}

describe('RateLimitGuard', () => {
  it('allows requests without rate-limit metadata', async () => {
    const guard = buildGuard({ options: undefined })
    await expect(guard.canActivate(makeContext())).resolves.toBe(true)
  })

  it('allows when RATE_LIMIT_ENABLED is false', async () => {
    const guard = buildGuard({
      options: { scope: 'auth:login', limit: 1, windowSeconds: 60 },
      enabled: 'false',
    })
    await expect(guard.canActivate(makeContext())).resolves.toBe(true)
  })

  it('allows under the limit', async () => {
    const guard = buildGuard({
      options: { scope: 'auth:login', limit: 5, windowSeconds: 60 },
      incrResults: [1],
    })
    await expect(guard.canActivate(makeContext())).resolves.toBe(true)
  })

  it('throws 429 when over the limit', async () => {
    const guard = buildGuard({
      options: { scope: 'auth:login', limit: 5, windowSeconds: 60 },
      incrResults: [6],
    })
    await expect(guard.canActivate(makeContext())).rejects.toBeInstanceOf(HttpException)
    try {
      await guard.canActivate(makeContext())
    } catch (e) {
      const response = (e as HttpException).getResponse() as { code: string }
      expect(response.code).toBe('RATE_LIMITED')
    }
  })

  it('falls back to in-memory counter when Redis returns null', async () => {
    const guard = buildGuard({
      options: { scope: 'auth:login', limit: 2, windowSeconds: 60 },
      incrResults: [null],
    })
    const ctx = makeContext('9.9.9.9')
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    await expect(guard.canActivate(ctx)).resolves.toBe(true)
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(HttpException)
  })
})
