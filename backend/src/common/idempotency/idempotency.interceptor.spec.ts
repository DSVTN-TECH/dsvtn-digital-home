import { CallHandler, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { firstValueFrom, of } from 'rxjs'
import { RedisService } from '../redis'
import { IdempotencyInterceptor } from './idempotency.interceptor'
import { IdempotencyOptions } from './idempotency.decorator'

function makeContext(headers: Record<string, string> = {}): ExecutionContext {
  const request = { headers }
  return {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext
}

function makeHandler(value: unknown): CallHandler {
  return { handle: () => of(value) }
}

function buildInterceptor(opts: {
  options: IdempotencyOptions | undefined
  stored?: string | null
}) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(opts.options),
  } as unknown as Reflector
  const redis = {
    get: jest.fn().mockResolvedValue(opts.stored ?? null),
    set: jest.fn().mockResolvedValue(true),
  }
  const interceptor = new IdempotencyInterceptor(reflector, redis as unknown as RedisService)
  return { interceptor, redis }
}

describe('IdempotencyInterceptor', () => {
  it('passes through when no metadata', async () => {
    const { interceptor } = buildInterceptor({ options: undefined })
    const result$ = await interceptor.intercept(makeContext(), makeHandler('fresh'))
    await expect(firstValueFrom(result$)).resolves.toBe('fresh')
  })

  it('passes through when idempotency header missing', async () => {
    const { interceptor, redis } = buildInterceptor({ options: { scope: 'orders' } })
    const result$ = await interceptor.intercept(makeContext(), makeHandler('fresh'))
    await expect(firstValueFrom(result$)).resolves.toBe('fresh')
    expect(redis.get).not.toHaveBeenCalled()
  })

  it('returns stored result on replay', async () => {
    const { interceptor, redis } = buildInterceptor({
      options: { scope: 'orders' },
      stored: JSON.stringify({ id: 'order-1' }),
    })
    const ctx = makeContext({ 'idempotency-key': 'abc' })
    const result$ = await interceptor.intercept(ctx, makeHandler({ id: 'should-not-run' }))
    await expect(firstValueFrom(result$)).resolves.toEqual({ id: 'order-1' })
    expect(redis.get).toHaveBeenCalledWith('idem:orders:abc')
  })

  it('stores result after successful handler', async () => {
    const { interceptor, redis } = buildInterceptor({ options: { scope: 'orders' } })
    const ctx = makeContext({ 'idempotency-key': 'abc' })
    const result$ = await interceptor.intercept(ctx, makeHandler({ id: 'order-2' }))
    await firstValueFrom(result$)
    expect(redis.set).toHaveBeenCalledWith(
      'idem:orders:abc',
      JSON.stringify({ id: 'order-2' }),
      24 * 60 * 60,
    )
  })
})
