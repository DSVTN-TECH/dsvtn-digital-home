import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, IsUrl, Matches, MaxLength, Min } from 'class-validator'

export class CreateBadgeDto {
  @ApiProperty({ description: 'Stable identifier, uppercase snake', example: 'POINTS_100' })
  @IsString()
  @Matches(/^[A-Z0-9_]+$/, { message: 'code must be uppercase letters, digits, and underscores' })
  @MaxLength(64)
  code!: string

  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional({ description: 'HTTPS icon URL' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @IsOptional()
  iconUrl?: string

  @ApiProperty({ example: 'POINTS_TOTAL' })
  @IsString()
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'criteriaType must be uppercase letters, digits, underscores',
  })
  @MaxLength(64)
  criteriaType!: string

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  criteriaThreshold!: number
}
