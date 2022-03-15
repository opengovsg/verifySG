import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common'
import { UpdateOfficerDto } from './dto/officer.dto'
import { OfficersService } from './officers.service'
import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { OfficerId } from 'common/decorators'

@Controller('officers')
export class OfficersController {
  constructor(private officersService: OfficersService) {}

  @Post('update')
  @UseGuards(AuthOfficerGuard)
  async updateOfficer(
    @OfficerId() officerId: number,
    @Body() officerDetails: UpdateOfficerDto,
  ): Promise<void> {
    try {
      await this.officersService.updateOfficer(officerId, officerDetails)
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Failed to update officer details',
      )
    }
  }
}
