import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'
import { RedisService } from '../redis'
import { RATE_LIMIT_KEY, RateLimitOptions } from './rate-limit.decorator'

interface InMemoryEntry {
  count: number
  resetAt: number
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly fallback = new Map<string, InMemoryEntry>()

  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!options) return true

    if (this.config.get<string>('RATE_LIMIT_ENABLED') === 'false') return true

    const request = context.switchToHttp().getRequest<Request>()
    const identity = this.resolveIdentity(request, options.by ?? 'ip')
    const key = `rl:${options.scope}:${identity}`

    const count = await this.redis.incrWithTtl(key, options.windowSeconds)
    const current = count ?? this.incrementInMemory(key, options.windowSeconds)

    if (current > options.limit) {
      const retryAfterSeconds = this.retryAfter(key, options.windowSeconds, count === null)
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          details: { retryAfterSeconds },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      )
    }

    return true
  }

  private resolveIdentity(request: Request, by: 'ip' | 'user'): string {
    if (by === 'user') {
      const user = (request as Request & { user?: { id?: string } }).user
      if (user?.id) return user.id
    }
    const forwarded = request.headers['x-forwarded-for']
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim()
    return forwardedIp || request.ip || request.socket.remoteAddress || 'unknown'
  }

  private incrementInMemory(key: string, windowSeconds: number): number {
    const now = Date.now()
    const entry = this.fallback.get(key)
    if (!entry || entry.resetAt <= now) {
      this.fallback.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
      return 1
    }
    entry.count += 1
    return entry.count
  }

  private retryAfter(key: string, windowSeconds: number, fromMemory: boolean): number {
    if (fromMemory) {
      const entry = this.fallback.get(key)
      if (entry) return Math.max(1, Math.ceil((entry.resetAt - Date.now()) / 1000))
    }
    return windowSeconds
  }
}
