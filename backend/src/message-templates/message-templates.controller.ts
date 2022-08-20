import { Controller, Get, NotFoundException } from '@nestjs/common'

import { OfficerInfo, OfficerInfoInterface } from '../common/decorators'

import { MessageTemplatesService } from './message-templates.service'

import { MessageTemplatesResDto } from '~shared/types/api'

@Controller('message-templates')
export class MessageTemplatesController {
  constructor(private messageTemplatesService: MessageTemplatesService) {}

  /**
   * Endpoint for frontend to call to get all message templates based on officer's agency
   */
  @Get()
  async getAllMessageTemplatesByAgency(
    @OfficerInfo() officerInfo: OfficerInfoInterface,
  ): Promise<MessageTemplatesResDto> {
    const { officerId, officerAgency } = officerInfo
    if (!officerId || !officerAgency) {
      throw new NotFoundException('Officer not logged in')
    }
    return await this.messageTemplatesService.getMessageTemplatesByAgencyId(
      officerAgency,
    )
  }
}
