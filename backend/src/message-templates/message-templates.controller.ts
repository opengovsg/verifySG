import { Controller, Get, NotFoundException } from '@nestjs/common'

import { OfficerId } from '../common/decorators'
import { OfficersService } from '../officers/officers.service'

import { MessageTemplatesService } from './message-templates.service'

import { MessageTemplatesResDto } from '~shared/types/api'

@Controller('message-templates')
export class MessageTemplatesController {
  constructor(
    private messageTemplatesService: MessageTemplatesService,
    private officersService: OfficersService,
  ) {}

  @Get()
  async getAllMessageTemplatesByAgency(
    @OfficerId() officerId: number,
  ): Promise<MessageTemplatesResDto> {
    if (!officerId) {
      throw new NotFoundException('Officer not logged in')
    }
    const officer = await this.officersService.findById(officerId)
    if (!officer) {
      // not including the actual officer id since this is displayed on frontend
      throw new NotFoundException('No such officer found')
    }
    const { agency } = officer
    return await this.messageTemplatesService.getMessageTemplatesByAgencyId(
      agency.id,
    )
  }
}
