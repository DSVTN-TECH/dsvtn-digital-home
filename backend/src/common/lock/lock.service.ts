import { randomBytes } from 'crypto'
import { ConflictException, Injectable } from '@nestjs/common'
import { RedisService } from '../redis'

@Injectable()
export class LockService {
  constructor(private readonly redis: RedisService) {}

  async acquire(resource: string, ttlSeconds: number): Promise<string | null> {
    const token = randomBytes(16).toString('hex')
    const acquired = await this.redis.setIfAbsent(`lock:${resource}`, token, ttlSeconds)
    return acquired ? token : null
  }

  async release(resource: string, token: string): Promise<boolean> {
    return this.redis.releaseLock(`lock:${resource}`, token)
  }

  async withLock<T>(
    resource: string,
    ttlSeconds: number,
    fn: () => Promise<T>,
    conflictMessage = 'Resource is busy, try again later',
  ): Promise<T> {
    if (!this.redis.isReady()) {
      return fn()
    }
    const token = await this.acquire(resource, ttlSeconds)
    if (!token) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: conflictMessage,
        details: { lockTtlSeconds: ttlSeconds },
      })
    }
    try {
      return await fn()
    } finally {
      await this.release(resource, token)
    }
  }
}
