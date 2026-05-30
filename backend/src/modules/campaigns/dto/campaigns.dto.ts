import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator'
import { CampaignStatus } from '@prisma/client'

export class CreateCampaignDto {
  @ApiProperty({ example: 'Gây quỹ áo polo 2026' })
  @IsString()
  @MaxLength(150)
  title!: string

  @ApiPropertyOptional({ example: 'Gây quỹ cho hoạt động mùa hè.' })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: 'https://example.com/campaign.jpg' })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  coverImageUrl?: string

  @ApiProperty({ example: 10000000, minimum: 1 })
  @IsInt()
  @Min(1)
  goalCents!: number

  @ApiProperty({ example: '2026-06-01' })
  @IsISO8601()
  startDate!: string

  @ApiProperty({ example: '2026-07-31' })
  @IsISO8601()
  endDate!: string

  @ApiPropertyOptional({ enum: CampaignStatus, default: 'DRAFT' })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ example: 'Gây quỹ áo polo 2026' })
  @IsString()
  @MaxLength(150)
  @IsOptional()
  title?: string

  @ApiPropertyOptional({ example: 'Gây quỹ cho hoạt động mùa hè.' })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: 'https://example.com/campaign.jpg' })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  coverImageUrl?: string

  @ApiPropertyOptional({ example: 10000000, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  goalCents?: number

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsISO8601()
  @IsOptional()
  startDate?: string

  @ApiPropertyOptional({ example: '2026-07-31' })
  @IsISO8601()
  @IsOptional()
  endDate?: string

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus
}

export class ListCampaignsQueryDto {
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

  @ApiPropertyOptional({ enum: CampaignStatus })
  @IsEnum(CampaignStatus)
  @IsOptional()
  status?: CampaignStatus
}

export class ListTransactionsQueryDto {
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

  @ApiPropertyOptional({
    enum: ['PENDING_PAYMENT_REVIEW', 'CONFIRMED', 'REJECTED', 'DELIVERED', 'CANCELLED'],
  })
  @IsString()
  @IsOptional()
  status?: string

  @ApiPropertyOptional({ example: 'uuid-campaign-1' })
  @IsString()
  @IsOptional()
  campaignId?: string
}
