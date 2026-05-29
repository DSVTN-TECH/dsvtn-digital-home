import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { VOLUNTEER_APPLICATIONS_REPOSITORY } from '../../common/repository'
import { PrismaVolunteerApplicationsRepository } from './prisma-volunteer-applications.repository'
import { VolunteerApplicationsController } from './volunteer-applications.controller'
import { VolunteerApplicationsService } from './volunteer-applications.service'

@Module({
  imports: [AuthModule],
  controllers: [VolunteerApplicationsController],
  providers: [
    VolunteerApplicationsService,
    {
      provide: VOLUNTEER_APPLICATIONS_REPOSITORY,
      useClass: PrismaVolunteerApplicationsRepository,
    },
  ],
})
export class VolunteerApplicationsModule {}
