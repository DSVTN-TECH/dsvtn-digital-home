import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

const STATUSES = ['CONFIRMED', 'REJECTED', 'DELIVERED', 'CANCELLED'] as const

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: STATUSES })
  @IsEnum(STATUSES, { message: `status must be one of: ${STATUSES.join(', ')}` })
  status!: (typeof STATUSES)[number]
}
