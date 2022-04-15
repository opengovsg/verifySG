import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsNotEmptyObject,
} from 'class-validator'
import { IsNric } from '../../common/decorators'
import { GetOfficerProfileDto } from '../../officers/dto'

export class SendNotificationDto {
  @IsString()
  @IsOptional()
  callScope: string

  @IsString()
  @IsNric()
  @IsNotEmpty()
  nric: string
}

export class SendNotificationResponseDto {
  @IsNumber()
  id: number

  @IsDate()
  createdAt: Date

  @IsString()
  callScope: string

  @IsNotEmptyObject()
  officer: GetOfficerProfileDto
}
