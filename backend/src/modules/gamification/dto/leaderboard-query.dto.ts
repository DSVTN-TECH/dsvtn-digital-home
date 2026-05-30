import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, Matches } from 'class-validator'

export class LeaderboardQueryDto {
  @ApiPropertyOptional({ example: '2026-05' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}$/, { message: 'month must use YYYY-MM format' })
  month?: string
}
