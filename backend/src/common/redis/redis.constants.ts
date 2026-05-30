export const REDIS_CLIENT = Symbol('REDIS_CLIENT')

export const REDIS_KEY = {
  rateLimit: (scope: string, id: string) => `rl:${scope}:${id}`,
  lock: (resource: string, id: string) => `lock:${resource}:${id}`,
  cache: (entity: string, id: string) => `cache:${entity}:${id}`,
  idempotency: (scope: string, key: string) => `idem:${scope}:${key}`,
  revokedRefresh: (jti: string) => `revoked:refresh:${jti}`,
} as const
