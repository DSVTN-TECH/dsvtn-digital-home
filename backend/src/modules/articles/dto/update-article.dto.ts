import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

const ARTICLE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const

export class UpdateArticleDto {
  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  title?: string

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(220)
  @IsOptional()
  slug?: string

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string

  @ApiPropertyOptional({ enum: ARTICLE_STATUSES })
  @IsEnum(ARTICLE_STATUSES)
  @IsOptional()
  status?: (typeof ARTICLE_STATUSES)[number]
}
