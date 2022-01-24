import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Call } from 'database/entities'
import { GetCallDto } from 'calls/dto'

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
  ) {}

  async getLatestCallForMop(mopId: number): Promise<Call | undefined> {
    // findOne does not return soft deleted entries
    // so there should only be one active call per search
    // order by descending just in case
    return this.callRepository.findOne({
      where: {
        mop: {
          id: mopId,
        },
      },
      order: { id: 'DESC' },
      relations: ['mop'],
    })
  }

  async getCallsForMop(mopId: number): Promise<Call[]> {
    return this.callRepository.find({
      where: {
        user: {
          id: mopId,
        },
      },
      order: { id: 'DESC' },
      relations: ['mop'],
      withDeleted: true,
    })
  }

  async createCall({
    mopId,
    officerId,
  }: {
    mopId: number
    officerId: number
  }): Promise<Call> {
    const callToAdd = this.callRepository.create({
      mop: { id: mopId },
      officer: { id: officerId },
    })
    return this.callRepository.save(callToAdd)
  }

  mapToDto(call: Call): GetCallDto {
    const { id, officer } = call
    return {
      id,
      officer: {
        id: officer.id,
        name: officer.name,
        email: officer.email,
        agency: officer.agency,
      },
    }
  }
}
