import { IsLowercase, IsString } from 'class-validator'

import { SGNotifyMessageTemplateId } from '../../utils'

export interface SGNotifyMessageTemplateParams {
  templateId: SGNotifyMessageTemplateId
  longMessageParams: Record<string, string> // exclude params recorded elsewhere like agency and officer info
}

export class MessageTemplateDto {
  @IsString()
  @IsLowercase()
  key: string

  @IsString()
  menu: string

  sgNotifyMessageTemplateParams: SGNotifyMessageTemplateParams
}

export type MessageTemplateResDto = Omit<
  MessageTemplateDto,
  'sgNotifyMessageTemplateParams'
>

export type MessageTemplatesResDto = MessageTemplateResDto[]
