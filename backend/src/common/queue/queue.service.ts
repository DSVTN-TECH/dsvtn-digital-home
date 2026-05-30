import { randomUUID } from 'crypto'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from '../redis'
import { EnqueueOptions, JobHandler, QueueJob, QueueName } from './queue.types'

const DEFAULT_MAX_ATTEMPTS = 3
const DEFAULT_BACKOFF_MS = 50
const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60

interface ProcessResult {
  success: boolean
  error?: string
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name)
  private readonly handlers = new Map<QueueName, JobHandler>()

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  register<T>(name: QueueName, handler: JobHandler<T>): void {
    if (this.handlers.has(name)) {
      this.logger.warn(`Handler for queue ${name} is being overwritten`)
    }
    this.handlers.set(name, handler as JobHandler)
  }

  pendingKey(name: QueueName): string {
    return `queue:${name}:pending`
  }

  deadKey(name: QueueName): string {
    return `queue:${name}:dead`
  }

  async enqueue<T>(
    name: QueueName,
    payload: T,
    options: EnqueueOptions = {},
  ): Promise<QueueJob<T> | null> {
    const jobId = options.jobId ?? randomUUID()
    const idemKey = `idem:queue:${name}:${jobId}`

    const reserved = await this.redis.setIfAbsent(idemKey, '1', IDEMPOTENCY_TTL_SECONDS)
    if (!reserved && this.redis.isReady()) {
      this.logger.debug(`Skipping duplicate job ${name}:${jobId}`)
      return null
    }

    const job: QueueJob<T> = {
      id: jobId,
      name,
      payload,
      attempts: 0,
      enqueuedAt: new Date().toISOString(),
    }
    const rawJob = JSON.stringify(job)

    await this.listPush(this.pendingKey(name), rawJob)

    if (this.config.get<string>('QUEUE_ENABLED') !== 'false') {
      void this.processStored(job, rawJob, options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS)
    }

    return job
  }

  async process<T>(
    job: QueueJob<T>,
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    backoffMs = DEFAULT_BACKOFF_MS,
  ): Promise<boolean> {
    const result = await this.run(job, maxAttempts, backoffMs)
    if (!result.success) {
      await this.deadLetter(job, result.error ?? 'unknown error')
    }
    return result.success
  }

  private async processStored<T>(
    job: QueueJob<T>,
    rawJob: string,
    maxAttempts: number,
  ): Promise<void> {
    const result = await this.run(job, maxAttempts, DEFAULT_BACKOFF_MS)
    if (result.success) {
      await this.listRemove(this.pendingKey(job.name), rawJob)
      return
    }
    await this.deadLetter(job, result.error ?? 'unknown error', rawJob)
  }

  private async run<T>(
    job: QueueJob<T>,
    maxAttempts: number,
    backoffMs: number,
  ): Promise<ProcessResult> {
    const handler = this.handlers.get(job.name)
    if (!handler) {
      const error = `No handler registered for queue ${job.name}`
      this.logger.warn(`${error}; job ${job.id} dropped`)
      return { success: false, error }
    }

    let lastError = 'unknown error'
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      job.attempts = attempt
      try {
        await handler(job.payload, job)
        return { success: true }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'unknown error'
        this.logger.warn(`Job ${job.name}:${job.id} attempt ${attempt} failed: ${lastError}`)
        if (attempt < maxAttempts) {
          await this.sleep(backoffMs * attempt)
        }
      }
    }

    return { success: false, error: lastError }
  }

  private async deadLetter<T>(job: QueueJob<T>, error: string, rawJob?: string): Promise<void> {
    this.logger.error(`Job ${job.name}:${job.id} exhausted retries; moving to dead-letter`)
    if (rawJob) {
      await this.listRemove(this.pendingKey(job.name), rawJob)
    }
    await this.listPush(this.deadKey(job.name), JSON.stringify({ ...job, error }))
  }

  private async listPush(key: string, value: string): Promise<void> {
    try {
      await this.redis.getClient().lpush(key, value)
    } catch (err) {
      this.logger.warn(`Queue LPUSH failed for ${key}: ${(err as Error).message}`)
    }
  }

  private async listRemove(key: string, value: string): Promise<void> {
    try {
      await this.redis.getClient().lrem(key, 1, value)
    } catch (err) {
      this.logger.warn(`Queue LREM failed for ${key}: ${(err as Error).message}`)
    }
  }

  private sleep(ms: number): Promise<void> {
    if (ms <= 0) return Promise.resolve()
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
