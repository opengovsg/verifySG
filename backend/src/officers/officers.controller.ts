import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { CreateOfficerDto } from './dto/create-officer.dto'
import { OfficersService } from './officers.service'
import { Officer } from '../database/entities'

@Controller('officers')
export class OfficersController {
  constructor(private officersService: OfficersService) {}
  @Post()
  async createOfficer(
    @Body() createOfficerDto: CreateOfficerDto,
  ): Promise<Officer> {
    try {
      return await this.officersService.findOrInsert(createOfficerDto)
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Failed to create officer',
      )
    }
  }
}
