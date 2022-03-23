import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'

import { CreateCallDto, GetCallDto } from 'calls/dto'
import { OfficerId } from 'common/decorators'
import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { CallsService } from './calls.service'

@Controller('calls')
export class CallsController {
  constructor(private callsService: CallsService) {}

  /**
   * Creates new call given an officerId and call body
   * @param body: CreateCallDto
   * @returns GetCallDto
   */
  @UseGuards(AuthOfficerGuard)
  @Post()
  async createNewCall(
    @OfficerId() officerId: number,
    @Body() body: CreateCallDto,
  ): Promise<GetCallDto> {
    const inserted = await this.callsService.createCall(officerId, body)
    if (!inserted) throw new BadRequestException('Call not created')

    // TODO: Notification service
    return this.callsService.mapToDto(inserted)
  }
}
