import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { GamificationService } from './gamification.service'
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto'

@ApiTags('gamification')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('member')
export class GamificationController {
  constructor(private readonly gamification: GamificationService) {}

  @Get('streak')
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'Get own streak and total points' })
  getStreak(@CurrentUser() user: { id: string }) {
    return this.gamification.getStreak(user.id)
  }

  @Get('leaderboard')
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'Get monthly leaderboard' })
  getLeaderboard(@Query() query: LeaderboardQueryDto) {
    return this.gamification.getLeaderboard(query.month)
  }
}
