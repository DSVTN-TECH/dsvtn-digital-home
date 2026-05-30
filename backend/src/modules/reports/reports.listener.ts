import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { CACHE_KEY, CacheService } from '../../common/cache'
import { DomainEvents } from '../../common/events/domain-events'

@Injectable()
export class ReportsListener {
  constructor(private readonly cache: CacheService) {}

  @OnEvent(DomainEvents.volunteerReviewed)
  @OnEvent(DomainEvents.matcherRun)
  @OnEvent(DomainEvents.assignmentOverride)
  @OnEvent(DomainEvents.assignmentCompleted)
  @OnEvent(DomainEvents.orderStatusChanged)
  async invalidateReportsCache(): Promise<void> {
    await Promise.all([
      this.cache.invalidate(CACHE_KEY.reportsDashboard()),
      this.cache.invalidateByPrefix(CACHE_KEY.reportsOverviewPrefix()),
    ])
  }
}
