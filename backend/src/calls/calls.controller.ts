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
   * Get latest call for user
   */
  @UseGuards(AuthMopGuard)
  @Get('latest')
  async getLatestCallForMop(@MopId() mopId: number): Promise<GetCallDto> {
    const call = await this.callsService.getLatestCallForMop(mopId)
    if (!call) {
      throw new HttpException(
        'No call found for given id',
        HttpStatus.NOT_FOUND,
      )
    }
    return this.callsService.mapToDto(call)
  }

  /**
   * Get all calls for user
   */
  @UseGuards(AuthMopGuard)
  @Get()
  async getCallsForMop(@MopId() mopId: number): Promise<GetCallDto[]> {
    const calls = await this.callsService.getCallsForMop(mopId)
    return calls.map(this.callsService.mapToDto)
  }

  /**
   * Create new call
   */
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

    // TODO: add default expiration time for calls
    const inserted = await this.callsService.createCall({
      mopId: mop.id,
      officerId,
    })
    return this.callsService.mapToDto(inserted)
  }
}
