import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

export class OrderItemDto {
  @ApiProperty({ example: 'uuid-product-1' })
  @IsUUID()
  productId!: string

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number
}

export class CreateOrderDto {
  @ApiProperty({ example: 'Le Thi D' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName!: string

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{9,11}$/, { message: 'customerPhone must be 9-11 digits' })
  customerPhone!: string

  @ApiProperty({ example: '123 Nguyen Hue, Q1, HCM' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  customerAddress!: string

  @ApiProperty({ example: 'https://drive.google.com/file/d/abc123' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^https:\/\//, { message: 'paymentProofUrl must start with https://' })
  @MaxLength(500)
  paymentProofUrl!: string

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'items must have at least 1 item' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[]
}
