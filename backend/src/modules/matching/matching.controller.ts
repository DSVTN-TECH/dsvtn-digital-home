import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { MatchingService } from './matching.service'

@ApiTags('matching')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller()
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  @Post('admin/activities/:id/matcher/run')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Run greedy matcher for activity (admin)' })
  run(@Param('id') id: string) {
    return this.service.runMatcher(id)
  }

  @Get('admin/activities/:id/assignments')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List assignments for activity (admin)' })
  getAssignments(@Param('id') id: string) {
    return this.service.getAssignments(id)
  }

  @Get('member/activities/:id/assignments')
  @Roles('MEMBER', 'ADMIN')
  @ApiOperation({ summary: 'Get my assignment for activity (member)' })
  getMyAssignments(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.service.getMyAssignments(id, user.id)
  }
}
