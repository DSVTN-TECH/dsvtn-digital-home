import { Module } from '@nestjs/common'
import { ActivitiesModule } from '../activities/activities.module'
import { LockModule } from '../../common/lock'
import { ASSIGNMENTS_REPOSITORY, MatchingService } from './matching.service'
import { MatchingController } from './matching.controller'
import { PrismaAssignmentsRepository } from './prisma-assignments.repository'

@Module({
  imports: [ActivitiesModule, LockModule],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    { provide: ASSIGNMENTS_REPOSITORY, useClass: PrismaAssignmentsRepository },
  ],
})
export class MatchingModule {}
