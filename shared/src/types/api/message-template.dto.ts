import { IsLowercase, IsString } from 'class-validator'

import { SGNotifyMessageTemplateId } from '../../utils'

export enum MessageTemplateType {
  SGNOTIFY = 'SGNOTIFY',
  SMS = 'SMS',
}

export interface SGNotifyMessageTemplateParams {
  type: MessageTemplateType.SGNOTIFY
  templateId: SGNotifyMessageTemplateId
  longMessageParams: Record<string, string> // exclude params recorded elsewhere like agency and officer info
}

export interface SMSMessageTemplateParams {
  type: MessageTemplateType.SMS
  requiredParams: string[]
  message: string
}

export type MessageTemplateParams =
  | SGNotifyMessageTemplateParams
  | SMSMessageTemplateParams

export class MessageTemplateDto {
  @IsString()
  @IsLowercase()
  key: string

  @IsString()
  menu: string

  params: MessageTemplateParams

  type: MessageTemplateType
}

export type MessageTemplateResDto = MessageTemplateDto

export type MessageTemplateSendNotificationResDto = Omit<
  MessageTemplateDto,
  'params'
>

export type MessageTemplatesResDto = MessageTemplateSendNotificationResDto[]
