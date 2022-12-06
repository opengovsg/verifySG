import { IsDate, IsString, Length } from 'class-validator'

import { IsMobileNumber, IsNric } from '../../decorators'

import {
  MessageTemplateSendNotificationResDto,
  MessageTemplateType,
} from './message-template.dto'
import { OfficerDto } from './officer.dto'

export type SendNotificationReqDto =
  | SendNotificationReqSGNotifyDto
  | SendNotificationReqSmsDto

export class SendNotificationReqSGNotifyDto {
  type: MessageTemplateType.SGNOTIFY

  @IsNric()
  nric: string

  @IsString()
  msgTemplateKey: string
}

export class SendNotificationReqSmsDto {
  type: MessageTemplateType.SMS

  @IsString()
  @Length(8, 8)
  @IsMobileNumber()
  recipientPhoneNumber: string

  @IsString()
  msgTemplateKey: string
}

export class SendNotificationResDto {
  @IsDate()
  createdAt: Date

  officer: OfficerDto

  messageTemplate: MessageTemplateSendNotificationResDto
}
