import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RateLimit, RateLimitGuard } from '../../common/rate-limit'
import { Idempotent, IdempotencyInterceptor } from '../../common/idempotency'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { InvitesService } from './invites.service'
import { AcceptInviteDto, CreateInviteDto, ListInvitesQueryDto } from './dto/invites.dto'

@ApiTags('invites')
@Controller()
export class InvitesController {
  constructor(private readonly invites: InvitesService) {}

  @Post('admin/invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create one-time invite token/link (admin)' })
  create(@Body() dto: CreateInviteDto, @CurrentUser() user: { id: string }) {
    return this.invites.create(dto, user.id)
  }

  @Get('admin/invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List invite history (admin)' })
  list(@Query() query: ListInvitesQueryDto) {
    return this.invites.list(query)
  }

  @Patch('admin/invites/:id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a pending invite (admin)' })
  revoke(@Param('id') id: string) {
    return this.invites.revoke(id)
  }

  @Post('public/invites/:token/accept')
  @UseGuards(RateLimitGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @RateLimit({ scope: 'public:invite-accept', limit: 10, windowSeconds: 600, by: 'ip' })
  @Idempotent({ scope: 'invite-accept' })
  @ApiOperation({ summary: 'Accept invite and set password (public token)' })
  accept(@Param('token') token: string, @Body() dto: AcceptInviteDto) {
    return this.invites.accept(token, dto)
  }
}
