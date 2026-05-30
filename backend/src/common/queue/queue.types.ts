export const QUEUE_NAME = {
  email: 'email',
  notifications: 'notifications',
  points: 'points',
  badges: 'badges',
  reports: 'reports',
} as const

export type QueueName = (typeof QUEUE_NAME)[keyof typeof QUEUE_NAME]

export interface QueueJob<T = unknown> {
  id: string
  name: QueueName
  payload: T
  attempts: number
  enqueuedAt: string
}

export type JobHandler<T = unknown> = (payload: T, job: QueueJob<T>) => Promise<void>

export interface EnqueueOptions {
  jobId?: string
  maxAttempts?: number
}
