import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../redis'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)
  private readonly defaultTtlSeconds: number

  constructor(
    private readonly redis: RedisService,
    config: ConfigService,
  ) {
    this.defaultTtlSeconds = Number(config.get<string>('CACHE_DEFAULT_TTL_SECONDS') ?? '60')
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      this.logger.warn(`Cache parse failed for ${key}; treating as miss`)
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    const ttl = ttlSeconds ?? this.defaultTtlSeconds
    return this.redis.set(key, JSON.stringify(value), ttl)
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const fresh = await factory()
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds)
    }
    return fresh
  }

  async invalidate(key: string): Promise<number> {
    return this.redis.del(key)
  }

  async invalidateByPrefix(prefix: string): Promise<number> {
    return this.redis.delByPrefix(prefix)
  }
}
