import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, Min } from 'class-validator'

export class CreateProductDto {
  @ApiProperty({ example: 'Áo Polo ĐSVTN 2026' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @ApiProperty({ example: 150000, description: 'Price in cents (VND)' })
  @IsInt()
  @Min(1, { message: 'priceCents must be > 0' })
  priceCents!: number

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string
}
