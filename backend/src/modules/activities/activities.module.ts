import { Module } from '@nestjs/common'
import { ACTIVITIES_REPOSITORY, TASKS_REPOSITORY } from '../../common/repository'
import { PrismaActivitiesRepository } from './prisma-activities.repository'
import { PrismaTasksRepository } from './prisma-tasks.repository'
import { ActivitiesController } from './activities.controller'
import { TasksController } from './tasks.controller'
import { ActivitiesService } from './activities.service'
import { TasksService } from './tasks.service'

@Module({
  controllers: [ActivitiesController, TasksController],
  providers: [
    ActivitiesService,
    TasksService,
    {
      provide: ACTIVITIES_REPOSITORY,
      useClass: PrismaActivitiesRepository,
    },
    {
      provide: TASKS_REPOSITORY,
      useClass: PrismaTasksRepository,
    },
  ],
  exports: [ActivitiesService, TasksService, ACTIVITIES_REPOSITORY, TASKS_REPOSITORY],
})
export class ActivitiesModule {}
