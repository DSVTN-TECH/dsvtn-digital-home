import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { PrismaReportsRepository } from './prisma-reports.repository'
import { ReportsController } from './reports.controller'
import { ReportsListener } from './reports.listener'
import { REPORTS_REPOSITORY } from './reports.repository'
import { ReportsService } from './reports.service'

@Module({
  imports: [AuthModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsListener,
    { provide: REPORTS_REPOSITORY, useClass: PrismaReportsRepository },
  ],
  exports: [ReportsService],
})
export class ReportsModule {}
