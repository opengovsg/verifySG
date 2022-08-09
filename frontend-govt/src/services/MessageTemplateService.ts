import { ApiService } from './ApiService'

import { MessageTemplateResDto } from '~shared/types/api'

const getMessageTemplates = async (): Promise<MessageTemplateResDto[]> => {
  return await ApiService.get('message-templates').then((res) => res.data)
}

export const MessageTemplateService = {
  getMessageTemplates,
}
