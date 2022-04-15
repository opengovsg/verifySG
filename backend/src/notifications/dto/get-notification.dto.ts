import { GetOfficerProfileDto } from 'officers/dto/get-officer.dto'
import { IsDate, IsNotEmptyObject, IsNumber, IsString } from 'class-validator'

export class GetNotificationDto {
  @IsNumber()
  id: number

  @IsDate()
  createdAt: Date

  @IsString()
  callScope: string

  @IsNotEmptyObject()
  officer: GetOfficerProfileDto
}
