import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Call } from 'database/entities'
import { GetCallDto, CreateCallDto } from './dto'
import { MopsService } from 'mops/mops.service'
import { OfficersService } from 'officers/officers.service'

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
    private readonly mopsService: MopsService,
    private officersService: OfficersService,
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
      relations: ['mop', 'officer'],
    })
  }

  async getCallsForMop(mopId: number): Promise<Call[]> {
    return this.callRepository.find({
      where: {
        mop: {
          id: mopId,
        },
      },
      order: { id: 'DESC' },
      relations: ['mop', 'officer'],
      withDeleted: true,
    })
  }

  async findById(id: number): Promise<Call | undefined> {
    return this.callRepository.findOne(id, {
      relations: ['officer', 'officer.agency'],
    })
  }

  async createCall(
    officerId: number,
    callBody: CreateCallDto,
  ): Promise<Call | undefined> {
    const { nric, callScope } = callBody
    const mop = await this.mopsService.findOrInsert({ nric })

    const callToAdd = this.callRepository.create({
      callScope,
      mop: { id: mop.id },
      officer: { id: officerId },
    })
    const addedCall = await this.callRepository.save(callToAdd)
    return this.findById(addedCall.id)
  }

  mapToDto(call: Call): GetCallDto {
    const { id, officer, createdAt, callScope } = call
    return {
      id,
      createdAt,
      callScope,
      officer: this.officersService.mapToDto(officer),
    }
  }
}
