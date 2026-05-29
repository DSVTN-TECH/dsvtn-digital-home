import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { ActivitiesService } from './activities.service'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@ApiTags('activities')
@Controller()
export class ActivitiesController {
  constructor(private readonly service: ActivitiesService) {}

  @Get('admin/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all activities (admin)' })
  @ApiQuery({ name: 'status', required: false })
  findAllAdmin(@Query('status') status?: string) {
    return this.service.findAllAdmin(status as never)
  }

  @Post('admin/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create activity (admin)' })
  create(@Body() dto: CreateActivityDto, @CurrentUser() user: { id: string }) {
    return this.service.create(dto, user.id)
  }

  @Get('admin/activities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity detail (admin)' })
  findOneAdmin(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch('admin/activities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update activity (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.service.update(id, dto)
  }

  @Get('member/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List OPEN activities (member)' })
  findOpenForMember() {
    return this.service.findOpenForMember()
  }

  @Get('member/activities/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MEMBER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activity detail (member)' })
  findOneForMember(@Param('id') id: string) {
    return this.service.findOne(id)
  }
}
