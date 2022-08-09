import { IsDate, IsNumber, IsString } from 'class-validator'

import { IsNric } from '../../decorators'

import { MessageTemplateResDto } from './message-template.dto'
import { OfficerDto } from './officer.dto'

export class SendNotificationReqDto {
  @IsNric()
  nric: string

  @IsString()
  msgTemplateKey: string
}

export class SendNotificationResDto {
  @IsNumber()
  id: number

  @IsDate()
  createdAt: Date

  officer: OfficerDto

  messageTemplate: MessageTemplateResDto
}
