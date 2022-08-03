import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Officer } from '../database/entities'
import { InjectRepository } from '@nestjs/typeorm'

import { AgenciesService } from 'agencies/agencies.service'
import { normalizeEmail } from '~shared/utils/email'
import { OfficerDto, UpdateOfficerResDto } from '~shared/types/api'

@Injectable()
export class OfficersService {
  constructor(
    @InjectRepository(Officer) private officerRepository: Repository<Officer>,
    private agencyService: AgenciesService,
  ) {}

  async findOrInsertByEmail(email: string): Promise<Officer> {
    const officerEmail = normalizeEmail(email)
    const foundOfficer = await this.findByEmail(officerEmail)

    if (foundOfficer) return foundOfficer
    return await this.createOfficerByEmail(officerEmail)
  }

  async createOfficerByEmail(email: string): Promise<Officer> {
    const agency = await this.agencyService.findByEmail(email)
    if (!agency) throw new Error(`No agency for ${email} found`)

    const officerToAdd = this.officerRepository.create({ email, agency })
    return this.officerRepository.save(officerToAdd)
  }

  async findById(id: number): Promise<Officer | undefined> {
    return this.officerRepository.findOne(id, {
      relations: ['agency'],
    })
  }

  async findByEmail(email: string): Promise<Officer | undefined> {
    email = normalizeEmail(email)
    return this.officerRepository.findOne({
      where: { email },
      relations: ['agency'],
    })
  }

  async updateOfficer(
    id: number,
    officerDetails: UpdateOfficerResDto,
  ): Promise<void> {
    const officerToUpdate = await this.officerRepository.findOne(id)
    if (!officerToUpdate) {
      throw new Error(`Officer ${id} not found`)
    }
    await this.officerRepository.update({ id }, officerDetails)
  }

  mapToDto(officer: Officer): OfficerDto {
    const { id, name, position, agency } = officer
    return {
      id,
      name,
      position,
      agency: this.agencyService.mapToDto(agency),
    }
  }
}
