import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RegistrationsService } from './registrations.service'
import { CreateRegistrationDto } from './dto/create-registration.dto'

@ApiTags('registrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller()
export class RegistrationsController {
  constructor(private readonly service: RegistrationsService) {}

  @Post('member/activities/:activityId/registrations')
  @Roles('MEMBER', 'ADMIN')
  @ApiOperation({ summary: 'Submit registration with preferences (member)' })
  submit(
    @Param('activityId') activityId: string,
    @Body() dto: CreateRegistrationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.submit(activityId, user.id, dto)
  }

  @Get('admin/activities/:activityId/registrations')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List registrations of activity (admin)' })
  list(@Param('activityId') activityId: string) {
    return this.service.listByActivity(activityId)
  }
}
