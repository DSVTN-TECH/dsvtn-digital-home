import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateActivityDto {
  @ApiProperty({ example: 'Hiến máu tháng 6' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @ApiProperty({ example: '2026-06-15T08:00:00Z' })
  @IsDateString()
  startTime!: string

  @ApiProperty({ example: '2026-06-15T17:00:00Z' })
  @IsDateString()
  endTime!: string
}
