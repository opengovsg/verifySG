import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { MessageTemplate } from '../database/entities'

import {
  MessageTemplateDto,
  MessageTemplateParams,
  MessageTemplateSendNotificationResDto,
} from '~shared/types/api'

@Injectable()
export class MessageTemplatesService {
  constructor(
    @InjectRepository(MessageTemplate)
    private messageTemplateRepository: Repository<MessageTemplate>,
  ) {}

  async getMessageTemplateByAgencyId(
    key: string,
    agencyId: string,
  ): Promise<MessageTemplate | null> {
    return await this.messageTemplateRepository.findOne({
      where: { key, agency: { id: agencyId } },
    })
  }

  async getActiveMessageTemplatesByAgencyId(
    agencyId: string,
  ): Promise<MessageTemplateDto[]> {
    const messageTemplates = await this.messageTemplateRepository.find({
      where: { agency: { id: agencyId }, isActive: true },
      relations: ['agency'],
    })
    return messageTemplates.map(this.mapToDto)
  }

  async getMessageTemplateParams(key: string): Promise<{
    id: number
    params: MessageTemplateParams
  }> {
    const messageTemplate = await this.messageTemplateRepository.findOne({
      where: { key },
    })
    if (!messageTemplate) {
      throw new BadRequestException(
        `MessageTemplate with key ${key} does not exist`,
      )
    }
    const { id, params } = messageTemplate
    if (!params) {
      throw new BadRequestException(
        `MessageTemplate with key ${key} does not have params`,
      )
    }
    return {
      id,
      params,
    }
  }

  mapToDto(messageTemplate: MessageTemplate): MessageTemplateDto {
    const { key, menu, params, type } = messageTemplate
    return {
      key,
      menu,
      params,
      type,
    }
  }

  mapToResDto(
    messageTemplate: MessageTemplate,
  ): MessageTemplateSendNotificationResDto {
    const { key, menu, type } = messageTemplate
    return {
      key,
      menu,
      type,
    }
  }
}
