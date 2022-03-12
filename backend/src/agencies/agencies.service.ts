import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { CreateAgencyDto } from './dto/create-agency.dto'
import { UpdateAgencyDto } from './dto/update-agency.dto'

import { Agency } from 'database/entities/agency.entity'

@Injectable()
export class AgenciesService {
  constructor(
    @InjectRepository(Agency) private agencyRepository: Repository<Agency>,
  ) {}

  async createAgency(createAgencyDto: CreateAgencyDto): Promise<Agency> {
    const agencyToAdd = this.agencyRepository.create(createAgencyDto)
    return this.agencyRepository.save(agencyToAdd)
  }

  async findById(agencyId: string) {
    return this.agencyRepository.findOne({
      where: { id: agencyId },
    })
  }

  async findAgenciesById(agencyIds: string[]): Promise<Agency[]> {
    return this.agencyRepository.find({ where: { id: In(agencyIds) } })
  }

  async findAgencies(): Promise<Agency[]> {
    return this.agencyRepository.find()
  }

  async updateAgency(
    agencyId: string,
    updateAgencyDto: UpdateAgencyDto,
  ): Promise<Agency> {
    const agencyToUpdate = await this.findById(agencyId)
    if (!agencyToUpdate) {
      throw new Error(`Agency ${agencyId} not found`)
    }
    return await this.agencyRepository.save({
      id: agencyId,
      ...updateAgencyDto,
    })
  }

  splitCompoundAgencyIds(compoundId: string, delimiter = ','): string[] {
    return compoundId.split(delimiter)
  }
}
