import { ConflictException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { RedisService } from '../redis'
import { LockService } from './lock.service'

describe('LockService', () => {
  let service: LockService
  let redis: { setIfAbsent: jest.Mock; releaseLock: jest.Mock; isReady: jest.Mock }

  beforeEach(async () => {
    redis = {
      setIfAbsent: jest.fn().mockResolvedValue(true),
      releaseLock: jest.fn().mockResolvedValue(true),
      isReady: jest.fn().mockReturnValue(true),
    }
    const moduleRef = await Test.createTestingModule({
      providers: [LockService, { provide: RedisService, useValue: redis }],
    }).compile()
    service = moduleRef.get(LockService)
  })

  describe('acquire', () => {
    it('returns a token when lock is free', async () => {
      const token = await service.acquire('matcher:a1', 30)
      expect(token).toEqual(expect.any(String))
      expect(redis.setIfAbsent).toHaveBeenCalledWith('lock:matcher:a1', token, 30)
    })

    it('returns null when lock is held', async () => {
      redis.setIfAbsent.mockResolvedValue(false)
      const token = await service.acquire('matcher:a1', 30)
      expect(token).toBeNull()
    })
  })

  describe('release', () => {
    it('delegates to redis releaseLock with prefixed key', async () => {
      await service.release('matcher:a1', 'tok')
      expect(redis.releaseLock).toHaveBeenCalledWith('lock:matcher:a1', 'tok')
    })
  })

  describe('withLock', () => {
    it('runs fn and releases when lock acquired', async () => {
      const fn = jest.fn().mockResolvedValue('result')
      const result = await service.withLock('order:o1', 30, fn)
      expect(result).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(redis.releaseLock).toHaveBeenCalledTimes(1)
    })

    it('throws ConflictException when lock is held', async () => {
      redis.setIfAbsent.mockResolvedValue(false)
      const fn = jest.fn()
      await expect(service.withLock('order:o1', 30, fn)).rejects.toBeInstanceOf(ConflictException)
      expect(fn).not.toHaveBeenCalled()
    })

    it('releases lock even when fn throws', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('boom'))
      await expect(service.withLock('order:o1', 30, fn)).rejects.toThrow('boom')
      expect(redis.releaseLock).toHaveBeenCalledTimes(1)
    })

    it('runs fn without locking when Redis is not ready', async () => {
      redis.isReady.mockReturnValue(false)
      const fn = jest.fn().mockResolvedValue('result')
      const result = await service.withLock('order:o1', 30, fn)
      expect(result).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)
      expect(redis.setIfAbsent).not.toHaveBeenCalled()
      expect(redis.releaseLock).not.toHaveBeenCalled()
    })
  })
})
