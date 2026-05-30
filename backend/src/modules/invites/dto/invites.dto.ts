import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator'
import { InviteStatus, Role } from '@prisma/client'

export class CreateInviteDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ enum: Role, example: 'MEMBER' })
  @IsEnum(Role)
  role!: Role

  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 30 })
  @IsInt()
  @Min(1)
  @Max(30)
  @IsOptional()
  expiresInDays?: number = 7
}

export class ListInvitesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @Transform(({ value }) => (value === undefined ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1

  @ApiPropertyOptional({ default: 20 })
  @Transform(({ value }) => (value === undefined ? 20 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize = 20

  @ApiPropertyOptional({ enum: InviteStatus })
  @IsEnum(InviteStatus)
  @IsOptional()
  status?: InviteStatus
}

export class AcceptInviteDto {
  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @MinLength(2)
  fullName!: string

  @ApiProperty({ example: 'secure-password-123' })
  @IsString()
  @MinLength(8)
  password!: string
}
