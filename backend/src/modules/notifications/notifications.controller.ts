import { Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { ListNotificationsQueryDto } from './dto/list-notifications.dto'
import { NotificationsService } from './notifications.service'

@ApiTags('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('member/notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'List own notifications' })
  list(@CurrentUser() user: { id: string }, @Query() query: ListNotificationsQueryDto) {
    return this.notifications.listForUser(
      user.id,
      query.page,
      query.pageSize,
      query.unreadOnly === 'true',
    )
  }

  @Patch(':id/read')
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'Mark own notification read' })
  markRead(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.notifications.markRead(id, user.id)
  }

  @Post('read-all')
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'Mark all own notifications read' })
  markAllRead(@CurrentUser() user: { id: string }) {
    return this.notifications.markAllRead(user.id)
  }
}
