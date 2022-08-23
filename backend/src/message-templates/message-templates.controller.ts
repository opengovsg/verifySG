import { Controller, Get, UseGuards } from '@nestjs/common'

import { AuthOfficerGuard } from '../auth-officer/guards/auth-officer.guard'
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
  @UseGuards(AuthOfficerGuard)
  async getAllMessageTemplatesByAgency(
    @OfficerInfo() officerInfo: OfficerInfoInterface,
  ): Promise<MessageTemplatesResDto> {
    const { officerAgency } = officerInfo
    return await this.messageTemplatesService.getMessageTemplatesByAgencyId(
      officerAgency,
    )
  }
}
