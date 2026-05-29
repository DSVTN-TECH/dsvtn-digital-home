import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

const ARTICLE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const

export class CreateArticleDto {
  @ApiProperty({ example: 'Chiến dịch Xuân tình nguyện 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string

  @ApiPropertyOptional({ example: 'chien-dich-xuan-tinh-nguyen-2026' })
  @IsString()
  @IsOptional()
  @MaxLength(220)
  slug?: string

  @ApiProperty({ example: '## Nội dung\nMarkdown raw...' })
  @IsString()
  @IsNotEmpty()
  content!: string

  @ApiPropertyOptional({ enum: ARTICLE_STATUSES })
  @IsEnum(ARTICLE_STATUSES)
  @IsOptional()
  status?: (typeof ARTICLE_STATUSES)[number]
}
