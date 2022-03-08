import { Controller, Post, Body, UseGuards } from '@nestjs/common'

import { CreateCallDto, GetCallDto } from 'calls/dto'
import { OfficerId } from 'common/decorators'
import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { CallsService } from './calls.service'
import { MopsService } from 'mops/mops.service'

@Controller('calls')
export class CallsController {
  constructor(
    private callsService: CallsService,
    private mopsService: MopsService,
  ) {}

  /**
   * Creates new call given an officerId and mopNric
   * @param body: CreateCallDto
   * @returns GetCallDto
   */
  @UseGuards(AuthOfficerGuard)
  @Post()
  async createNewCall(
    @OfficerId() officerId: number,
    @Body() body: CreateCallDto,
  ): Promise<GetCallDto> {
    const { mopNric } = body
    // TODO: add default expiration time for calls
    const inserted = await this.callsService.createCall({
      mopNric,
      officerId,
    })
    return this.callsService.mapToDto(inserted)
  }
}
