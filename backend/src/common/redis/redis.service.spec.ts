import { Test } from '@nestjs/testing'
import type Redis from 'ioredis'
import { REDIS_CLIENT } from './redis.constants'
import { RedisService } from './redis.service'

type MockRedis = {
  ping: jest.Mock
  get: jest.Mock
  set: jest.Mock
  del: jest.Mock
  scan: jest.Mock
  incr: jest.Mock
  expire: jest.Mock
  eval: jest.Mock
  status: 'ready' | 'connecting' | 'end'
}

function makeMockRedis(overrides: Partial<MockRedis> = {}): MockRedis {
  return {
    ping: jest.fn().mockResolvedValue('PONG'),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(0),
    scan: jest.fn().mockResolvedValue(['0', []]),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    eval: jest.fn().mockResolvedValue(1),
    status: 'ready',
    ...overrides,
  }
}

async function buildService(client: MockRedis): Promise<RedisService> {
  const moduleRef = await Test.createTestingModule({
    providers: [RedisService, { provide: REDIS_CLIENT, useValue: client as unknown as Redis }],
  }).compile()
  return moduleRef.get(RedisService)
}

describe('RedisService', () => {
  describe('ping', () => {
    it('returns true when Redis responds with PONG', async () => {
      const client = makeMockRedis()
      const service = await buildService(client)
      await expect(service.ping()).resolves.toBe(true)
    })

    it('returns false when client throws', async () => {
      const client = makeMockRedis({
        ping: jest.fn().mockRejectedValue(new Error('connection refused')),
      })
      const service = await buildService(client)
      await expect(service.ping()).resolves.toBe(false)
    })
  })

  describe('isReady', () => {
    it('reflects underlying client status', async () => {
      const ready = await buildService(makeMockRedis({ status: 'ready' }))
      const connecting = await buildService(makeMockRedis({ status: 'connecting' }))
      expect(ready.isReady()).toBe(true)
      expect(connecting.isReady()).toBe(false)
    })
  })

  describe('set with ttl', () => {
    it('uses EX flag when ttlSeconds > 0', async () => {
      const client = makeMockRedis()
      const service = await buildService(client)
      await service.set('cache:user:1', 'payload', 60)
      expect(client.set).toHaveBeenCalledWith('cache:user:1', 'payload', 'EX', 60)
    })

    it('omits EX when ttl missing', async () => {
      const client = makeMockRedis()
      const service = await buildService(client)
      await service.set('cache:user:1', 'payload')
      expect(client.set).toHaveBeenCalledWith('cache:user:1', 'payload')
    })
  })

  describe('failure-soft helpers', () => {
    it('get returns null when client throws', async () => {
      const client = makeMockRedis({
        get: jest.fn().mockRejectedValue(new Error('boom')),
      })
      const service = await buildService(client)
      await expect(service.get('cache:user:1')).resolves.toBeNull()
    })

    it('set returns false when client throws', async () => {
      const client = makeMockRedis({
        set: jest.fn().mockRejectedValue(new Error('boom')),
      })
      const service = await buildService(client)
      await expect(service.set('k', 'v', 1)).resolves.toBe(false)
    })

    it('del returns 0 when client throws', async () => {
      const client = makeMockRedis({
        del: jest.fn().mockRejectedValue(new Error('boom')),
      })
      const service = await buildService(client)
      await expect(service.del('k')).resolves.toBe(0)
    })

    it('incrWithTtl returns null when client throws', async () => {
      const client = makeMockRedis({
        incr: jest.fn().mockRejectedValue(new Error('boom')),
      })
      const service = await buildService(client)
      await expect(service.incrWithTtl('rl:auth:login:1.2.3.4', 60)).resolves.toBeNull()
    })
  })

  describe('incrWithTtl', () => {
    it('sets TTL only on first increment', async () => {
      const client = makeMockRedis({
        incr: jest.fn().mockResolvedValueOnce(1).mockResolvedValueOnce(2),
      })
      const service = await buildService(client)
      await service.incrWithTtl('rl:scope:a', 30)
      await service.incrWithTtl('rl:scope:a', 30)
      expect(client.expire).toHaveBeenCalledTimes(1)
      expect(client.expire).toHaveBeenCalledWith('rl:scope:a', 30)
    })
  })

  describe('setIfAbsent', () => {
    it('returns true when SET NX succeeds', async () => {
      const client = makeMockRedis({
        set: jest.fn().mockResolvedValue('OK'),
      })
      const service = await buildService(client)
      await expect(service.setIfAbsent('lock:matcher:1', 'token', 30)).resolves.toBe(true)
      expect(client.set).toHaveBeenCalledWith('lock:matcher:1', 'token', 'EX', 30, 'NX')
    })

    it('returns false when SET NX returns null (already held)', async () => {
      const client = makeMockRedis({
        set: jest.fn().mockResolvedValue(null),
      })
      const service = await buildService(client)
      await expect(service.setIfAbsent('lock:matcher:1', 'token', 30)).resolves.toBe(false)
    })
  })

  describe('releaseLock', () => {
    it('returns true when token matches', async () => {
      const client = makeMockRedis({
        eval: jest.fn().mockResolvedValue(1),
      })
      const service = await buildService(client)
      await expect(service.releaseLock('lock:matcher:1', 'mine')).resolves.toBe(true)
      expect(client.eval).toHaveBeenCalledWith(expect.any(String), 1, 'lock:matcher:1', 'mine')
    })

    it('returns false when token does not match', async () => {
      const client = makeMockRedis({
        eval: jest.fn().mockResolvedValue(0),
      })
      const service = await buildService(client)
      await expect(service.releaseLock('lock:matcher:1', 'someone-else')).resolves.toBe(false)
    })
  })

  describe('delByPrefix', () => {
    it('scans and deletes all matching keys', async () => {
      const client = makeMockRedis({
        scan: jest
          .fn()
          .mockResolvedValueOnce(['12', ['cache:user:1', 'cache:user:2']])
          .mockResolvedValueOnce(['0', ['cache:user:3']]),
        del: jest.fn().mockResolvedValue(3),
      })
      const service = await buildService(client)
      await expect(service.delByPrefix('cache:user:')).resolves.toBe(3)
      expect(client.del).toHaveBeenCalledWith('cache:user:1', 'cache:user:2', 'cache:user:3')
    })

    it('returns 0 when no keys match', async () => {
      const client = makeMockRedis({
        scan: jest.fn().mockResolvedValue(['0', []]),
      })
      const service = await buildService(client)
      await expect(service.delByPrefix('cache:none:')).resolves.toBe(0)
      expect(client.del).not.toHaveBeenCalled()
    })
  })
})
