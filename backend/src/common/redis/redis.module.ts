import { Global, Module } from '@nestjs/common'
import { redisClientProvider } from './redis.providers'
import { RedisService } from './redis.service'
import { REDIS_CLIENT } from './redis.constants'

@Global()
@Module({
  providers: [redisClientProvider, RedisService],
  exports: [RedisService, REDIS_CLIENT],
})
export class RedisModule {}
