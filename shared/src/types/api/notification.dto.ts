import { IsDate, IsString } from 'class-validator'

import { IsNric } from '../../decorators'

import { MessageTemplateSendNotificationResDto } from './message-template.dto'
import { OfficerDto } from './officer.dto'

export class SendNotificationReqDto {
  @IsNric()
  nric: string

  @IsString()
  msgTemplateKey: string
}

export class SendNotificationResDto {
  @IsDate()
  createdAt: Date

  officer: OfficerDto

  messageTemplate: MessageTemplateSendNotificationResDto
}
