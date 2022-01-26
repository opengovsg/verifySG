import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Connection, EntityManager } from 'typeorm'

import { Mop } from 'database/entities/mop.entity'
import { MopDto } from './dto'
import nric from 'nric'

@Injectable()
export class MopsService {
  constructor(
    @InjectRepository(Mop) private mopRepository: Repository<Mop>,
    private connection: Connection,
  ) {}

  async getById(id: number): Promise<Mop | undefined> {
    return this.mopRepository.findOne(id)
  }

  async findOrInsert(mop: MopDto): Promise<Mop> {
    return this.connection.transaction(async (manager: EntityManager) => {
      const foundMop = await manager.getRepository(Mop).findOne({
        where: { nric: this.sanitizeNric(mop.nric) },
      })
      if (foundMop) {
        return foundMop
      }
      const mopToAdd = this.mopRepository.create(mop)
      return manager.save(mopToAdd)
    })
  }

  sanitizeNric(nricString: string): string | Error {
    if (!nric.validate(nricString)) {
      throw new Error(`Nric ${nricString} not valid`)
    }
    return nricString.toUpperCase()
  }
}
