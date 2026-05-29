import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'

const ASSIGNMENT_STATUSES = ['PROPOSED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const

export class UpdateAssignmentDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  userId?: string

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  taskId?: string

  @ApiPropertyOptional({ enum: ASSIGNMENT_STATUSES })
  @IsEnum(ASSIGNMENT_STATUSES)
  @IsOptional()
  status?: (typeof ASSIGNMENT_STATUSES)[number]
}
