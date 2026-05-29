import { Module } from '@nestjs/common'
import { ACTIVITIES_REPOSITORY } from '../../common/repository'
import { PrismaActivitiesRepository } from './prisma-activities.repository'
import { ActivitiesController } from './activities.controller'
import { ActivitiesService } from './activities.service'

@Module({
  controllers: [ActivitiesController],
  providers: [
    ActivitiesService,
    {
      provide: ACTIVITIES_REPOSITORY,
      useClass: PrismaActivitiesRepository,
    },
  ],
  exports: [ActivitiesService, ACTIVITIES_REPOSITORY],
})
export class ActivitiesModule {}
