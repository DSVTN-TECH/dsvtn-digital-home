import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../redis'
import { CacheService } from './cache.service'

type RedisMock = {
  get: jest.Mock
  set: jest.Mock
  del: jest.Mock
  delByPrefix: jest.Mock
}

function makeRedis(overrides: Partial<RedisMock> = {}): RedisMock {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(1),
    delByPrefix: jest.fn().mockResolvedValue(0),
    ...overrides,
  }
}

async function build(redis: RedisMock, ttl = '60'): Promise<CacheService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      CacheService,
      { provide: RedisService, useValue: redis as unknown as RedisService },
      { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(ttl) } },
    ],
  }).compile()
  return moduleRef.get(CacheService)
}

describe('CacheService', () => {
  describe('get', () => {
    it('returns parsed value on hit', async () => {
      const redis = makeRedis({ get: jest.fn().mockResolvedValue(JSON.stringify({ a: 1 })) })
      const cache = await build(redis)
      await expect(cache.get<{ a: number }>('cache:x:1')).resolves.toEqual({ a: 1 })
    })

    it('returns null on miss', async () => {
      const cache = await build(makeRedis())
      await expect(cache.get('cache:x:1')).resolves.toBeNull()
    })

    it('returns null and does not throw on malformed JSON', async () => {
      const redis = makeRedis({ get: jest.fn().mockResolvedValue('not-json{') })
      const cache = await build(redis)
      await expect(cache.get('cache:x:1')).resolves.toBeNull()
    })
  })

  describe('set', () => {
    it('serializes value and uses default TTL', async () => {
      const redis = makeRedis()
      const cache = await build(redis, '90')
      await cache.set('cache:x:1', { a: 1 })
      expect(redis.set).toHaveBeenCalledWith('cache:x:1', JSON.stringify({ a: 1 }), 90)
    })

    it('honors explicit TTL override', async () => {
      const redis = makeRedis()
      const cache = await build(redis)
      await cache.set('cache:x:1', 'v', 5)
      expect(redis.set).toHaveBeenCalledWith('cache:x:1', JSON.stringify('v'), 5)
    })
  })

  describe('getOrSet', () => {
    it('returns cached value without calling factory on hit', async () => {
      const redis = makeRedis({ get: jest.fn().mockResolvedValue(JSON.stringify('cached')) })
      const cache = await build(redis)
      const factory = jest.fn().mockResolvedValue('fresh')
      await expect(cache.getOrSet('cache:x:1', factory)).resolves.toBe('cached')
      expect(factory).not.toHaveBeenCalled()
    })

    it('calls factory and stores result on miss', async () => {
      const redis = makeRedis()
      const cache = await build(redis)
      const factory = jest.fn().mockResolvedValue('fresh')
      await expect(cache.getOrSet('cache:x:1', factory, 30)).resolves.toBe('fresh')
      expect(factory).toHaveBeenCalledTimes(1)
      expect(redis.set).toHaveBeenCalledWith('cache:x:1', JSON.stringify('fresh'), 30)
    })

    it('does not cache null factory results', async () => {
      const redis = makeRedis()
      const cache = await build(redis)
      const factory = jest.fn().mockResolvedValue(null)
      await expect(cache.getOrSet('cache:x:1', factory)).resolves.toBeNull()
      expect(redis.set).not.toHaveBeenCalled()
    })
  })

  describe('invalidate', () => {
    it('deletes a single key', async () => {
      const redis = makeRedis()
      const cache = await build(redis)
      await cache.invalidate('cache:x:1')
      expect(redis.del).toHaveBeenCalledWith('cache:x:1')
    })

    it('deletes by prefix', async () => {
      const redis = makeRedis({ delByPrefix: jest.fn().mockResolvedValue(3) })
      const cache = await build(redis)
      await expect(cache.invalidateByPrefix('cache:x:')).resolves.toBe(3)
      expect(redis.delByPrefix).toHaveBeenCalledWith('cache:x:')
    })
  })
})
