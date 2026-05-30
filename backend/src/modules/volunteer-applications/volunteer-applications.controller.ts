import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { RateLimit, RateLimitGuard } from '../../common/rate-limit'
import { Idempotent, IdempotencyInterceptor } from '../../common/idempotency'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { VolunteerApplicationsService } from './volunteer-applications.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ReviewApplicationDto } from './dto/review-application.dto'

@ApiTags('volunteer-applications')
@Controller()
export class VolunteerApplicationsController {
  constructor(private readonly service: VolunteerApplicationsService) {}

  @Post('public/volunteer-applications')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RateLimitGuard)
  @UseInterceptors(IdempotencyInterceptor)
  @RateLimit({ scope: 'public:volunteer-applications', limit: 5, windowSeconds: 600, by: 'ip' })
  @Idempotent({ scope: 'volunteer-applications' })
  @ApiOperation({ summary: 'Submit volunteer application (public)' })
  submit(@Body() dto: CreateApplicationDto) {
    return this.service.submit(dto)
  }

  @Get('admin/volunteer-applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all applications (admin)' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status)
  }

  @Patch('admin/volunteer-applications/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject application (admin)' })
  review(
    @Param('id') id: string,
    @Body() dto: ReviewApplicationDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.service.review(id, dto, user.id)
  }
}
