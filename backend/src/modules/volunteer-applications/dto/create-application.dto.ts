import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export class CreateApplicationDto {
  @ApiProperty({ example: 'Trần Thị C' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string

  @ApiProperty({ example: 'c@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: '0912345678', description: '9-11 digits' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{9,11}$/, { message: 'phone must be 9-11 digits' })
  phone!: string

  @ApiProperty({ example: 'SV001', description: 'MSSV, required (Q1)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  studentId!: string

  @ApiPropertyOptional({ example: 'Available on weekends' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string
}
