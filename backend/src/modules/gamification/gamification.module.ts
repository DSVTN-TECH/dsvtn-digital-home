import { Module } from '@nestjs/common'
import { GAMIFICATION_REPOSITORY } from '../../common/repository'
import { AuthModule } from '../auth/auth.module'
import { BadgesModule } from '../badges/badges.module'
import { GamificationController } from './gamification.controller'
import { GamificationService } from './gamification.service'
import { GamificationListener } from './gamification.listener'
import { PrismaGamificationRepository } from './prisma-gamification.repository'

@Module({
  imports: [AuthModule, BadgesModule],
  controllers: [GamificationController],
  providers: [
    GamificationService,
    GamificationListener,
    { provide: GAMIFICATION_REPOSITORY, useClass: PrismaGamificationRepository },
  ],
  exports: [GamificationService],
})
export class GamificationModule {}
