import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { CampaignsController } from './campaigns.controller'
import { CampaignsListener } from './campaigns.listener'
import { CAMPAIGNS_REPOSITORY } from './campaigns.repository'
import { CampaignsService } from './campaigns.service'
import { PrismaCampaignsRepository } from './prisma-campaigns.repository'

@Module({
  imports: [AuthModule],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    CampaignsListener,
    { provide: CAMPAIGNS_REPOSITORY, useClass: PrismaCampaignsRepository },
  ],
  exports: [CampaignsService],
})
export class CampaignsModule {}
