import { Module } from '@nestjs/common'
import { EmailModule } from '../../common/email'
import { VOLUNTEER_APPLICATIONS_REPOSITORY } from '../../common/repository'
import { AuthModule } from '../auth/auth.module'
import { PrismaVolunteerApplicationsRepository } from './prisma-volunteer-applications.repository'
import { VolunteerApplicationsController } from './volunteer-applications.controller'
import { VolunteerApplicationsService } from './volunteer-applications.service'

@Module({
  imports: [AuthModule, EmailModule],
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
