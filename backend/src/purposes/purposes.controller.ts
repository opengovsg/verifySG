import { Controller, Get, NotFoundException } from '@nestjs/common'

import { OfficerId } from '../common/decorators'
import { OfficersService } from '../officers/officers.service'
import { AllPurposesDto } from './dto'
import { PurposesService } from './purposes.service'

@Controller('purposes')
export class PurposesController {
  constructor(
    private purposesService: PurposesService,
    private officersService: OfficersService,
  ) {}

  @Get('all')
  async all(@OfficerId() officerId: number): Promise<AllPurposesDto> {
    if (!officerId) {
      throw new NotFoundException('Officer not logged in')
    }
    const officer = await this.officersService.findById(officerId)
    if (!officer) {
      throw new NotFoundException('No officer with this officer ID found')
    }
    const { agency } = officer
    return await this.purposesService.getPurposesByAgencyId(agency.id)
  }
}
