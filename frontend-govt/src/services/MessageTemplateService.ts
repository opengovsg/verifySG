import { ApiService } from './ApiService'

import { MessageTemplateResDto } from '~shared/types/api'

const getMessageTemplates = async (): Promise<MessageTemplateResDto[]> => {
  return await ApiService.get('message-templates')
}

export const MessageTemplateService = {
  getMessageTemplates,
}
