import { Controller, Get, NotFoundException } from '@nestjs/common'

import { OfficerAgency, OfficerId } from '../common/decorators'

import { MessageTemplatesService } from './message-templates.service'

import { MessageTemplatesResDto } from '~shared/types/api'

@Controller('message-templates')
export class MessageTemplatesController {
  constructor(private messageTemplatesService: MessageTemplatesService) {}

  @Get()
  async getAllMessageTemplatesByAgency(
    @OfficerId() officerId: number,
    @OfficerAgency() officerAgency: string,
  ): Promise<MessageTemplatesResDto> {
    if (!officerId || !officerAgency) {
      throw new NotFoundException('Officer not logged in')
    }
    return await this.messageTemplatesService.getMessageTemplatesByAgencyId(
      officerAgency,
    )
  }
}
