import { IsDate, IsNumber, IsString } from 'class-validator'

import { IsNric } from '../../decorators'

import { OfficerDto } from './officer.dto'

export class SendNotificationReqDto {
  @IsString()
  @IsNric()
  nric: string
}

export class SendNotificationResDto {
  @IsNumber()
  id: number

  @IsDate()
  createdAt: Date

  officer: OfficerDto
}
