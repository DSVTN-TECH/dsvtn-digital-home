import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CampaignsService } from './campaigns.service'
import {
  CreateCampaignDto,
  ListCampaignsQueryDto,
  ListTransactionsQueryDto,
  UpdateCampaignDto,
} from './dto/campaigns.dto'

@ApiTags('campaigns')
@Controller()
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get('public/campaigns')
  @ApiOperation({ summary: 'List active campaigns with progress (public)' })
  listPublic() {
    return this.campaigns.listPublic()
  }

  @Get('public/campaigns/:id')
  @ApiOperation({ summary: 'Get active campaign detail with progress (public)' })
  getPublic(@Param('id') id: string) {
    return this.campaigns.getPublic(id)
  }

  @Get('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List campaigns (admin)' })
  listAdmin(@Query() query: ListCampaignsQueryDto) {
    return this.campaigns.listAdmin(query)
  }

  @Post('admin/campaigns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create campaign (admin)' })
  create(@Body() dto: CreateCampaignDto) {
    return this.campaigns.create(dto)
  }

  @Patch('admin/campaigns/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update campaign (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaigns.update(id, dto)
  }

  @Get('admin/fundraising/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'LOGISTIC')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Order-derived fundraising transactions (admin/logistic)' })
  listTransactions(@Query() query: ListTransactionsQueryDto) {
    return this.campaigns.listTransactions(query)
  }
}
