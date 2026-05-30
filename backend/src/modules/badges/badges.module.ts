import { Module } from '@nestjs/common'
import { BADGES_REPOSITORY } from '../../common/repository'
import { AuthModule } from '../auth/auth.module'
import { BadgesController } from './badges.controller'
import { BadgesService } from './badges.service'
import { PrismaBadgesRepository } from './prisma-badges.repository'

@Module({
  imports: [AuthModule],
  controllers: [BadgesController],
  providers: [BadgesService, { provide: BADGES_REPOSITORY, useClass: PrismaBadgesRepository }],
  exports: [BadgesService, BADGES_REPOSITORY],
})
export class BadgesModule {}
