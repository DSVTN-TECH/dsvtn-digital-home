import { Inject, Injectable, Logger } from '@nestjs/common'
import Redis from 'ioredis'
import { REDIS_CLIENT } from './redis.constants'

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async ping(): Promise<boolean> {
    try {
      const reply = await this.client.ping()
      return reply === 'PONG'
    } catch {
      return false
    }
  }

  isReady(): boolean {
    return this.client.status === 'ready'
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key)
    } catch (error) {
      this.logger.warn(`Redis GET failed for ${key}: ${(error as Error).message}`)
      return null
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, value, 'EX', ttlSeconds)
      } else {
        await this.client.set(key, value)
      }
      return true
    } catch (error) {
      this.logger.warn(`Redis SET failed for ${key}: ${(error as Error).message}`)
      return false
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.client.del(key)
    } catch (error) {
      this.logger.warn(`Redis DEL failed for ${key}: ${(error as Error).message}`)
      return 0
    }
  }

  async delByPrefix(prefix: string): Promise<number> {
    try {
      const keys: string[] = []
      let cursor = '0'
      do {
        const [next, batch] = await this.client.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 100)
        cursor = next
        keys.push(...batch)
      } while (cursor !== '0')
      if (keys.length === 0) return 0
      return await this.client.del(...keys)
    } catch (error) {
      this.logger.warn(`Redis DEL-by-prefix failed for ${prefix}: ${(error as Error).message}`)
      return 0
    }
  }

  async incrWithTtl(key: string, ttlSeconds: number): Promise<number | null> {
    try {
      const count = await this.client.incr(key)
      if (count === 1 && ttlSeconds > 0) {
        await this.client.expire(key, ttlSeconds)
      }
      return count
    } catch (error) {
      this.logger.warn(`Redis INCR failed for ${key}: ${(error as Error).message}`)
      return null
    }
  }

  async setIfAbsent(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    try {
      const reply = await this.client.set(key, value, 'EX', ttlSeconds, 'NX')
      return reply === 'OK'
    } catch (error) {
      this.logger.warn(`Redis SET NX failed for ${key}: ${(error as Error).message}`)
      return false
    }
  }

  async releaseLock(key: string, token: string): Promise<boolean> {
    try {
      const lua =
        "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end"
      const result = (await this.client.eval(lua, 1, key, token)) as number
      return result === 1
    } catch (error) {
      this.logger.warn(`Redis lock release failed for ${key}: ${(error as Error).message}`)
      return false
    }
  }

  getClient(): Redis {
    return this.client
  }
}
