import { ApiProperty } from '@nestjs/swagger'
import { IsEnum } from 'class-validator'

export class ReviewApplicationDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'] as const, {
    message: 'status must be APPROVED or REJECTED',
  })
  status!: 'APPROVED' | 'REJECTED'
}
