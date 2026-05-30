import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { ProfileService } from './profile.service'

@ApiTags('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('member/profile')
export class ProfileController {
  constructor(private readonly profile: ProfileService) {}

  @Get()
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'Get own profile, history, and badges' })
  getOwn(@CurrentUser() user: { id: string }) {
    return this.profile.getOwnProfile(user.id)
  }

  @Get('impact')
  @Roles('MEMBER', 'ADMIN', 'LOGISTIC')
  @ApiOperation({ summary: 'Get own impact KPIs' })
  getImpact(@CurrentUser() user: { id: string }) {
    return this.profile.getOwnImpact(user.id)
  }
}
