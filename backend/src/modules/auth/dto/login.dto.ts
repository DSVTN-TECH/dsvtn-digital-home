import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'admin@dsvtn.vn' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: 'changeme', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  password!: string
}
