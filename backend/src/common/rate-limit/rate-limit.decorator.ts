import { SetMetadata } from '@nestjs/common'

export const RATE_LIMIT_KEY = 'rate-limit-options'

export interface RateLimitOptions {
  limit: number
  windowSeconds: number
  scope: string
  by?: 'ip' | 'user'
}

export const RateLimit = (options: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, options)
