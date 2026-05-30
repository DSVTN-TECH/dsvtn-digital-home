import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ChangePasswordDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string
}
