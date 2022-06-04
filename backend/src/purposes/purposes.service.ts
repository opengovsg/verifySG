import { Injectable } from '@nestjs/common'
import { Purpose } from '../database/entities'
import { AllPurposesDto } from './dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class PurposesService {
  constructor(
    @InjectRepository(Purpose)
    private purposeRepository: Repository<Purpose>,
  ) {}

  async getPurposesByAgencyId(agencyId: string): Promise<Purpose[]> {
    return await this.purposeRepository.find({
      where: { agency: { id: agencyId } },
      relations: ['agency'],
    })
  }
  mapToAllPurposeDto(purposes: Purpose[]): AllPurposesDto {
    return {
      purposes: purposes.map((purposeEntity) => {
        const { purposeId, menuDescription, sgNotifyPurposeParams } =
          purposeEntity
        return {
          purposeId,
          menuDescription,
          sgNotifyPurposeParams,
        }
      }),
    }
  }
}
