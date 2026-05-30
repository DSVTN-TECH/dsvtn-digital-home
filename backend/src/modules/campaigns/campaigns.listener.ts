import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { DomainEvents } from '../../common/events/domain-events'
import { CampaignsService } from './campaigns.service'

@Injectable()
export class CampaignsListener {
  constructor(private readonly campaigns: CampaignsService) {}

  @OnEvent(DomainEvents.orderStatusChanged)
  async invalidateOnOrderStatusChange(): Promise<void> {
    await this.campaigns.invalidate()
  }
}
