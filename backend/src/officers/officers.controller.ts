import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  UseGuards,
} from '@nestjs/common'

import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'

import { OfficerInfo, OfficerInfoInterface } from '../common/decorators'

import { OfficersService } from './officers.service'

import { OfficerResDto, UpdateOfficerReqDto } from '~shared/types/api'

@Controller('officers')
export class OfficersController {
  constructor(private officersService: OfficersService) {}

  @Get()
  @UseGuards(AuthOfficerGuard)
  async getOfficer(
    @OfficerInfo() officerInfo: OfficerInfoInterface,
  ): Promise<OfficerResDto> {
    const officer = await this.officersService.findById(officerInfo.officerId)
    if (!officer) throw new NotFoundException('Officer not found')
    return this.officersService.mapToDto(officer)
  }

  @Post('update')
  @UseGuards(AuthOfficerGuard)
  async updateOfficer(
    @OfficerInfo() officerInfo: OfficerInfoInterface,
    @Body() officerDetails: UpdateOfficerReqDto,
  ): Promise<void> {
    try {
      await this.officersService.updateOfficer(
        officerInfo.officerId,
        officerDetails,
      )
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Failed to update officer details',
      )
    }
  }
}
