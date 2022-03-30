import {
  BadRequestException,
  NotFoundException,
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common'
import { AgenciesService } from './agencies.service'
import { CreateAgencyDto } from './dto'
import { UpdateAgencyDto } from './dto'

import { AuthAdminGuard } from 'auth-admin/guards/auth-admin.guard'
import { Agency } from 'database/entities/agency.entity'

@UseGuards(AuthAdminGuard)
@Controller('agencies')
export class AgenciesController {
  constructor(private readonly agencyService: AgenciesService) {}

  @Post()
  async create(@Body() createAgencyDto: CreateAgencyDto): Promise<Agency> {
    try {
      return await this.agencyService.createAgency(createAgencyDto)
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Failed to create agency',
      )
    }
  }

  @Get()
  async findAll(): Promise<Agency[]> {
    return await this.agencyService.findAgencies()
  }

  @Get(':id')
  async findAgency(@Param('id') ids: string): Promise<Agency[]> {
    const agencyIds = this.agencyService.splitCompoundAgencyIds(ids)
    const agencies = await this.agencyService.findAgenciesById(agencyIds)
    if (agencies.length !== agencyIds.length)
      throw new NotFoundException('Not all agency ids are valid')

    return await this.agencyService.findAgenciesById(agencyIds)
  }

  @Put(':id')
  async update(
    @Param('id') agencyId: string,
    @Body() updateAgencyDto: UpdateAgencyDto,
  ): Promise<Agency> {
    try {
      return await this.agencyService.updateAgency(agencyId, updateAgencyDto)
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error
          ? err.message
          : `Failed to update agency ${agencyId}`,
      )
    }
  }
}
