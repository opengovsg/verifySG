import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'

import { CreateCallDto, GetCallDto } from 'calls/dto'
import { MopId } from 'common/decorators'
import { AuthMopGuard } from 'auth-mop/guards/auth-mop.guard'
import { CallsService } from './calls.service'
import { MopsService } from 'mops/mops.service'

@Controller('calls')
export class CallsController {
  constructor(
    private callsService: CallsService,
    private mopsService: MopsService,
  ) {}

  /**
   * Get calls for all user
   */
  @Get()
  async getLatestCallForMop(@MopId() userId: number): Promise<GetCallDto> {
    const call = await this.callsService.getLatestCallForMop(userId)
    if (!call) {
      throw new HttpException(
        'No call found for given id',
        HttpStatus.NOT_FOUND,
      )
    }
    return this.callsService.mapToDto(call)
  }

  /**
   * Create new call
   */
  @UseGuards(AuthMopGuard)
  @Post()
  async createNewCall(
    @MopId() officerId: number,
    @Body() body: CreateCallDto,
  ): Promise<GetCallDto> {
    const { mopNric } = body
    const mop = await this.mopsService.getByNric(mopNric)
    if (!mop) {
      throw new HttpException(
        'No mop not found for given id',
        HttpStatus.NOT_FOUND,
      )
    }
    const inserted = await this.callsService.createCall({
      mopId: mop.id,
      officerId,
    })
    return this.callsService.mapToDto(inserted)
  }
}
