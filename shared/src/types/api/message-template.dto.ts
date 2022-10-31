import { IsLowercase, IsString } from 'class-validator'

import { SGNotifyMessageTemplateId } from '../../utils'

export interface SGNotifyMessageTemplateParams {
  templateId: SGNotifyMessageTemplateId
  longMessageParams: Record<string, string> // exclude params recorded elsewhere like agency and officer info
}

export interface SmsMessageTemplateParams {
  // TODO
  todo: string
}

export class MessageTemplateDto {
  @IsString()
  @IsLowercase()
  key: string

  @IsString()
  menu: string

  sgNotifyMessageTemplateParams: SGNotifyMessageTemplateParams | null

  smsMessageTemplateParams: SmsMessageTemplateParams | null
}

export type MessageTemplateResDto = MessageTemplateDto

export type MessageTemplateSendNotificationResDto = Omit<
  MessageTemplateDto,
  'sgNotifyMessageTemplateParams' | 'smsMessageTemplateParams'
>

export type MessageTemplatesResDto = MessageTemplateSendNotificationResDto[]
