import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'

const STATUSES = ['DRAFT', 'OPEN', 'CLOSED', 'MATCHED', 'COMPLETED'] as const

export class UpdateActivityDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startTime?: string

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endTime?: string

  @ApiPropertyOptional({ enum: STATUSES })
  @IsEnum(STATUSES, { message: `status must be one of: ${STATUSES.join(', ')}` })
  @IsOptional()
  status?: (typeof STATUSES)[number]
}
