import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import { RedisService } from '../redis'
import { IDEMPOTENCY_KEY, IdempotencyOptions } from './idempotency.decorator'

const DEFAULT_TTL_SECONDS = 24 * 60 * 60
const DEFAULT_HEADER = 'idempotency-key'

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const options = this.reflector.getAllAndOverride<IdempotencyOptions>(IDEMPOTENCY_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!options) return next.handle()

    const request = context.switchToHttp().getRequest<Request>()
    const headerName = options.header ?? DEFAULT_HEADER
    const headerValue = request.headers[headerName]
    const idempotencyKey = Array.isArray(headerValue) ? headerValue[0] : headerValue
    if (!idempotencyKey) return next.handle()

    const redisKey = `idem:${options.scope}:${idempotencyKey}`
    const stored = await this.redis.get(redisKey)
    if (stored !== null) {
      try {
        return of(JSON.parse(stored))
      } catch {
        return of(stored)
      }
    }

    const ttl = options.ttlSeconds ?? DEFAULT_TTL_SECONDS
    return next.handle().pipe(
      tap((response) => {
        void this.redis.set(redisKey, JSON.stringify(response ?? null), ttl)
      }),
    )
  }
}
