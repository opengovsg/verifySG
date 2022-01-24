import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Connection, EntityManager } from 'typeorm'

import { Mop } from 'database/entities/mop.entity'
import { MopDto } from './dto'

@Injectable()
export class MopsService {
  constructor(
    @InjectRepository(Mop) private mopRepository: Repository<Mop>,
    private connection: Connection,
  ) {}

  async getById(id: number): Promise<Mop | undefined> {
    return this.mopRepository.findOne(id)
  }

  async getByNric(nric: string): Promise<Mop | undefined> {
    return this.mopRepository.findOne({
      where: { nric },
    })
  }

  async findOrInsert(mop: MopDto): Promise<Mop> {
    return this.connection.transaction(async (manager: EntityManager) => {
      const foundUser = await manager.getRepository(Mop).findOne({
        where: { nric: mop.nric },
      })
      if (foundUser) {
        return foundUser
      }
      const userToAdd = this.mopRepository.create(mop)
      return manager.save(userToAdd)
    })
  }
}
