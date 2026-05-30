import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBooleanString, IsInt, IsOptional, Max, Min } from 'class-validator'

export class ListNotificationsQueryDto {
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

  @ApiPropertyOptional({ description: 'When "true", only unread notifications' })
  @IsBooleanString()
  @IsOptional()
  unreadOnly?: string
}
