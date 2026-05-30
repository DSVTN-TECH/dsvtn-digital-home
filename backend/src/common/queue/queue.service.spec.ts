import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../redis'
import { QueueService } from './queue.service'
import { QUEUE_NAME, QueueJob } from './queue.types'

type ClientMock = { lpush: jest.Mock; rpop: jest.Mock; lrem: jest.Mock }

type RedisMock = {
  setIfAbsent: jest.Mock
  isReady: jest.Mock
  getClient: jest.Mock
}

function makeRedis(overrides: Partial<RedisMock> = {}): { redis: RedisMock; client: ClientMock } {
  const client: ClientMock = {
    lpush: jest.fn().mockResolvedValue(1),
    rpop: jest.fn().mockResolvedValue(null),
    lrem: jest.fn().mockResolvedValue(1),
  }
  const redis: RedisMock = {
    setIfAbsent: jest.fn().mockResolvedValue(true),
    isReady: jest.fn().mockReturnValue(true),
    getClient: jest.fn().mockReturnValue(client),
    ...overrides,
  }
  return { redis, client }
}

async function build(redis: RedisMock, queueEnabled = 'false'): Promise<QueueService> {
  const moduleRef = await Test.createTestingModule({
    providers: [
      QueueService,
      { provide: RedisService, useValue: redis as unknown as RedisService },
      { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(queueEnabled) } },
    ],
  }).compile()
  return moduleRef.get(QueueService)
}

function makeJob<T>(name: QUEUE_NAME_TYPE, payload: T, id = 'job-1'): QueueJob<T> {
  return { id, name, payload, attempts: 0, enqueuedAt: '2026-01-01T00:00:00.000Z' }
}

type QUEUE_NAME_TYPE = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME]

describe('QueueService', () => {
  describe('enqueue', () => {
    it('reserves idempotency key, pushes job, and returns metadata', async () => {
      const { redis, client } = makeRedis()
      const queue = await build(redis)
      const job = await queue.enqueue(
        QUEUE_NAME.notifications,
        { userId: 'u1' },
        { jobId: 'src-1' },
      )
      expect(job).not.toBeNull()
      expect(job?.id).toBe('src-1')
      expect(job?.name).toBe(QUEUE_NAME.notifications)
      expect(job?.attempts).toBe(0)
      expect(redis.setIfAbsent).toHaveBeenCalledWith('idem:queue:notifications:src-1', '1', 86400)
      expect(client.lpush).toHaveBeenCalledWith('queue:notifications:pending', expect.any(String))
    })

    it('skips duplicate job when idempotency key exists and Redis is ready', async () => {
      const { redis, client } = makeRedis({
        setIfAbsent: jest.fn().mockResolvedValue(false),
        isReady: jest.fn().mockReturnValue(true),
      })
      const queue = await build(redis)
      const job = await queue.enqueue(QUEUE_NAME.points, { assignmentId: 'a1' }, { jobId: 'a1' })
      expect(job).toBeNull()
      expect(client.lpush).not.toHaveBeenCalled()
    })

    it('still enqueues when Redis is down (idempotency unavailable)', async () => {
      const { redis, client } = makeRedis({
        setIfAbsent: jest.fn().mockResolvedValue(false),
        isReady: jest.fn().mockReturnValue(false),
      })
      const queue = await build(redis)
      const job = await queue.enqueue(QUEUE_NAME.email, { to: 'x' }, { jobId: 'e1' })
      expect(job).not.toBeNull()
      expect(client.lpush).toHaveBeenCalled()
    })

    it('processes the job when QUEUE_ENABLED is not false', async () => {
      const { redis } = makeRedis()
      const queue = await build(redis, 'true')
      const handler = jest.fn().mockResolvedValue(undefined)
      queue.register(QUEUE_NAME.notifications, handler)
      await queue.enqueue(QUEUE_NAME.notifications, { userId: 'u1' }, { jobId: 'src-2' })
      await new Promise((resolve) => setImmediate(resolve))
      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(
        { userId: 'u1' },
        expect.objectContaining({ id: 'src-2' }),
      )
    })
  })

  describe('process', () => {
    it('invokes the registered handler and resolves true on success', async () => {
      const { redis } = makeRedis()
      const queue = await build(redis)
      const handler = jest.fn().mockResolvedValue(undefined)
      queue.register(QUEUE_NAME.points, handler)
      await expect(
        queue.process(makeJob(QUEUE_NAME.points, { assignmentId: 'a1' }), 3, 0),
      ).resolves.toBe(true)
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('dead-letters and resolves false when no handler is registered', async () => {
      const { redis, client } = makeRedis()
      const queue = await build(redis)
      await expect(queue.process(makeJob(QUEUE_NAME.badges, { code: 'X' }), 3, 0)).resolves.toBe(
        false,
      )
      expect(client.lpush).toHaveBeenCalledWith('queue:badges:dead', expect.any(String))
    })

    it('retries on failure then succeeds', async () => {
      const { redis } = makeRedis()
      const queue = await build(redis)
      const handler = jest
        .fn()
        .mockRejectedValueOnce(new Error('transient'))
        .mockResolvedValueOnce(undefined)
      queue.register(QUEUE_NAME.reports, handler)
      await queue.process(makeJob(QUEUE_NAME.reports, {}), 3, 0)
      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('moves job to dead-letter after exhausting attempts', async () => {
      const { redis, client } = makeRedis()
      const queue = await build(redis)
      const handler = jest.fn().mockRejectedValue(new Error('always fails'))
      queue.register(QUEUE_NAME.email, handler)
      await queue.process(makeJob(QUEUE_NAME.email, { to: 'x' }), 2, 0)
      expect(handler).toHaveBeenCalledTimes(2)
      expect(client.lpush).toHaveBeenCalledWith(
        'queue:email:dead',
        expect.stringContaining('always fails'),
      )
    })
  })
})
