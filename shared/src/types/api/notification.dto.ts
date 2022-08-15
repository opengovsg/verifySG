import { IsDate, IsNumber } from 'class-validator'

import { IsNric } from '../../decorators'

import { OfficerDto } from './officer.dto'

export class SendNotificationReqDto {
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
