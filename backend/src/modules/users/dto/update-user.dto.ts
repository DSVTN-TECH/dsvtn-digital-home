import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: ['ADMIN', 'MEMBER', 'LOGISTIC'] })
  @IsEnum(['ADMIN', 'MEMBER', 'LOGISTIC'] as const, {
    message: 'role must be ADMIN, MEMBER, or LOGISTIC',
  })
  @IsOptional()
  role?: 'ADMIN' | 'MEMBER' | 'LOGISTIC'

  @ApiPropertyOptional({ enum: ['ACTIVE', 'DISABLED'] })
  @IsEnum(['ACTIVE', 'DISABLED'] as const, {
    message: 'status must be ACTIVE or DISABLED',
  })
  @IsOptional()
  status?: 'ACTIVE' | 'DISABLED'
}
