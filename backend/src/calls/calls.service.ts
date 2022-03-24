import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Call } from 'database/entities'
import { GetCallDto, CreateCallDto } from './dto'
import { OfficersService } from 'officers/officers.service'

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
    private officersService: OfficersService,
  ) {
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
    const { callScope } = callBody
    const callToAdd = this.callRepository.create({
      callScope,
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
