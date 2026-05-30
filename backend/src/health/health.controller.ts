import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { RedisService } from '../common/redis'

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly startedAt = Date.now()

  constructor(private readonly redis: RedisService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    const redisOk = await this.redis.ping()
    return {
      status: redisOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startedAt) / 1000),
      dependencies: {
        redis: redisOk ? 'up' : 'down',
      },
    }
  }
}
