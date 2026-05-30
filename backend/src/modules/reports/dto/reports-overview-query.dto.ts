import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsIn, IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator'

export const REPORT_DATASETS = ['activities', 'orders'] as const
export type ReportDataset = (typeof REPORT_DATASETS)[number]

export class ReportsOverviewQueryDto {
  @ApiPropertyOptional({ enum: REPORT_DATASETS, default: 'activities' })
  @IsIn(REPORT_DATASETS)
  @IsOptional()
  dataset: ReportDataset = 'activities'

  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize = 20

  @ApiPropertyOptional({ description: 'Filter by status value for the selected dataset.' })
  @IsOptional()
  status?: string

  @ApiPropertyOptional({ description: 'ISO-8601 start of created/start time range (inclusive).' })
  @IsISO8601()
  @IsOptional()
  from?: string

  @ApiPropertyOptional({ description: 'ISO-8601 end of created/start time range (inclusive).' })
  @IsISO8601()
  @IsOptional()
  to?: string
}
