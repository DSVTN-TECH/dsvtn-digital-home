import { Module } from '@nestjs/common'
import {
  ACTIVITIES_REPOSITORY,
  REGISTRATIONS_REPOSITORY,
  TASKS_REPOSITORY,
} from '../../common/repository'
import { PrismaActivitiesRepository } from './prisma-activities.repository'
import { PrismaTasksRepository } from './prisma-tasks.repository'
import { PrismaRegistrationsRepository } from './prisma-registrations.repository'
import { ActivitiesController } from './activities.controller'
import { TasksController } from './tasks.controller'
import { RegistrationsController } from './registrations.controller'
import { ActivitiesService } from './activities.service'
import { TasksService } from './tasks.service'
import { RegistrationsService } from './registrations.service'

@Module({
  controllers: [ActivitiesController, TasksController, RegistrationsController],
  providers: [
    ActivitiesService,
    TasksService,
    RegistrationsService,
    { provide: ACTIVITIES_REPOSITORY, useClass: PrismaActivitiesRepository },
    { provide: TASKS_REPOSITORY, useClass: PrismaTasksRepository },
    { provide: REGISTRATIONS_REPOSITORY, useClass: PrismaRegistrationsRepository },
  ],
  exports: [
    ActivitiesService,
    TasksService,
    RegistrationsService,
    ACTIVITIES_REPOSITORY,
    TASKS_REPOSITORY,
    REGISTRATIONS_REPOSITORY,
  ],
})
export class ActivitiesModule {}
