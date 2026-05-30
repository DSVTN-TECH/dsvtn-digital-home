import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator'

export class CreateGalleryAlbumDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ description: 'HTTPS cover image URL' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @IsOptional()
  coverImageUrl?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  activityId?: string
}

export class UpdateGalleryAlbumDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(160)
  title?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @ApiPropertyOptional({ description: 'HTTPS cover image URL' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  @IsOptional()
  coverImageUrl?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  activityId?: string
}

export class AddGalleryPhotoDto {
  @ApiProperty({ description: 'HTTPS image URL' })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  imageUrl!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  caption?: string

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number
}
