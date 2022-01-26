import { Injectable } from '@nestjs/common'
import { Connection, Repository } from 'typeorm'
import { Officer } from '../database/entities'
import { InjectRepository } from '@nestjs/typeorm'
import { OfficerDto, UpdateOfficerDto } from './dto/officer.dto'

@Injectable()
export class OfficersService {
  constructor(
    @InjectRepository(Officer) private officerRepository: Repository<Officer>,
    private connection: Connection,
  ) {}

  async findOrInsert(officer: OfficerDto): Promise<Officer> {
    return this.connection.transaction(async (manager) => {
      const foundOfficer = await manager.getRepository(Officer).findOne({
        where: {
          email: officer.email,
        },
      })

      if (foundOfficer) {
        return foundOfficer
      }
      const officerToAdd = this.officerRepository.create(officer)
      return manager.save(officerToAdd)
    })
  }

  async getById(id: number): Promise<Officer | undefined> {
    return this.officerRepository.findOne(id)
  }

  async updateDetails(
    id: number,
    officerDetails: UpdateOfficerDto,
  ): Promise<void> {
    const officerToUpdate = await this.officerRepository.findOne(id)
    if (!officerToUpdate) {
      throw new Error(`Officer ${id} not found`)
    }
    await this.officerRepository.update({ id }, officerDetails)
  }
}
