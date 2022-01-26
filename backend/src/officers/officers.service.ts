import { Injectable } from '@nestjs/common'
import { Connection, Repository } from 'typeorm'
import { Officer } from '../database/entities'
import { InjectRepository } from '@nestjs/typeorm'
import { CreateOfficerDto } from './dto/create-officer.dto'

@Injectable()
export class OfficersService {
  constructor(
    @InjectRepository(Officer) private repo: Repository<Officer>,
    private connection: Connection,
  ) {}

  async findOrInsert(createOfficerDto: CreateOfficerDto): Promise<Officer> {
    return this.connection.transaction(async (manager) => {
      const foundOfficer = await manager.getRepository(Officer).findOne({
        where: {
          email: createOfficerDto.email,
        },
      })

      if (foundOfficer) {
        return foundOfficer
      }
      const officer = this.repo.create(createOfficerDto)
      return manager.save(officer)
    })
  }
}
