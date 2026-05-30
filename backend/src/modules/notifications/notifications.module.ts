import { Module } from '@nestjs/common'
import { NOTIFICATIONS_REPOSITORY } from '../../common/repository'
import { AuthModule } from '../auth/auth.module'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsListener } from './notifications.listener'
import { PrismaNotificationsRepository } from './prisma-notifications.repository'

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsListener,
    { provide: NOTIFICATIONS_REPOSITORY, useClass: PrismaNotificationsRepository },
  ],
  exports: [NotificationsService, NOTIFICATIONS_REPOSITORY],
})
export class NotificationsModule {}
