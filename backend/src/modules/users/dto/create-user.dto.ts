import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateUserDto {
  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string

  @ApiProperty({ example: 'member@dsvtn.vn' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ enum: ['ADMIN', 'MEMBER', 'LOGISTIC'] })
  @IsEnum(['ADMIN', 'MEMBER', 'LOGISTIC'] as const, {
    message: 'role must be ADMIN, MEMBER, or LOGISTIC',
  })
  role!: 'ADMIN' | 'MEMBER' | 'LOGISTIC'
}
