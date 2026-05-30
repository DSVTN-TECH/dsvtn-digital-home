import { Module } from '@nestjs/common'
import { PROFILE_REPOSITORY } from '../../common/repository'
import { AuthModule } from '../auth/auth.module'
import { BadgesModule } from '../badges/badges.module'
import { ProfileController } from './profile.controller'
import { ProfileService } from './profile.service'
import { PrismaProfileRepository } from './prisma-profile.repository'

@Module({
  imports: [AuthModule, BadgesModule],
  controllers: [ProfileController],
  providers: [ProfileService, { provide: PROFILE_REPOSITORY, useClass: PrismaProfileRepository }],
  exports: [ProfileService],
})
export class ProfileModule {}
