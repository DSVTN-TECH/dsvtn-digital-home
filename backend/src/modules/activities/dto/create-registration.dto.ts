import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsInt, IsUUID, Max, Min, ValidateNested } from 'class-validator'

export class PreferenceDto {
  @ApiProperty({ example: 'uuid-task-1' })
  @IsUUID()
  taskId!: string

  @ApiProperty({ example: 3, minimum: 0, maximum: 3 })
  @IsInt()
  @Min(0)
  @Max(3)
  score!: number
}

export class CreateRegistrationDto {
  @ApiProperty({ type: [PreferenceDto] })
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => PreferenceDto)
  preferences!: PreferenceDto[]
}
