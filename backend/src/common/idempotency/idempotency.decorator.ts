import { SetMetadata } from '@nestjs/common'

export const IDEMPOTENCY_KEY = 'idempotency-options'

export interface IdempotencyOptions {
  scope: string
  ttlSeconds?: number
  header?: string
}

export const Idempotent = (options: IdempotencyOptions) => SetMetadata(IDEMPOTENCY_KEY, options)
