import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { BadgesService } from './badges.service'
import { CreateBadgeDto } from './dto/create-badge.dto'

@ApiTags('badges')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller()
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get('member/badges')
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'List own earned badges' })
  listOwn(@CurrentUser() user: { id: string }) {
    return this.badges.listUserBadges(user.id)
  }

  @Get('admin/badges')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List badge definitions' })
  listDefinitions() {
    return this.badges.listDefinitions()
  }

  @Post('admin/badges')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create badge definition' })
  createDefinition(@Body() dto: CreateBadgeDto) {
    return this.badges.createDefinition(dto)
  }
}
