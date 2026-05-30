import { Controller, Get, Header, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { ReportsOverviewQueryDto } from './dto/reports-overview-query.dto'
import { ReportsService } from './reports.service'

@ApiTags('reports')
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard KPI cards (admin)' })
  dashboard() {
    return this.reports.dashboard()
  }

  @Get('overview')
  @ApiOperation({ summary: 'Aggregated report dataset with filters + pagination (admin)' })
  overview(@Query() query: ReportsOverviewQueryDto) {
    return this.reports.overview(query)
  }

  @Get('overview.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({ summary: 'Export current report dataset as CSV (admin)' })
  async overviewCsv(@Query() query: ReportsOverviewQueryDto, @Res() res: Response) {
    const csv = await this.reports.overviewCsv(query)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="reports-${query.dataset ?? 'activities'}.csv"`,
    )
    res.send(csv)
  }
}
