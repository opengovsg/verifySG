import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Logger } from '../core/providers'
import { DisplayData, UniqueParam } from '../database/entities'

import { generateUniqueParamString } from './unique-param-utils'

export enum UniqueParamVerificationResult {
  VALID = 'valid', // exists in db
  INVALID = 'invalid', // does not exist in db
  // EXPIRED = 'expired', // future extension
}

@Injectable()
export class UniqueParamService {
  constructor(
    @InjectRepository(UniqueParam)
    private uniqueParamsRepository: Repository<UniqueParam>,
    private logger: Logger,
  ) {}

  async generateUniqueParam(displayData: DisplayData): Promise<string> {
    const uniqueParamString = generateUniqueParamString()
    // should we check if uniqueParamString already exists in database?
    // YES: in case freak accidents happen
    // NO: trust in the power of nanoid
    const uniqueParamToAdd = this.uniqueParamsRepository.create({
      uniqueParamString,
      displayData,
    })
    await this.uniqueParamsRepository.save(uniqueParamToAdd)
    return uniqueParamString
  }

  async verifyUniqueParamString(uniqueParamString: string): Promise<{
    result: UniqueParamVerificationResult
    displayData: DisplayData | null
  }> {
    const uniqueParamFromDb = await this.uniqueParamsRepository.findOne({
      where: {
        uniqueParamString,
      },
    })
    if (!uniqueParamFromDb) {
      // possible scenarios:
      // (1) user is manually entering incorrect uniqueParamString (innocuous)
      // (2) script is trying to brute force uniqueParamString (malicious)
      this.logger.warn(
        `UniqueParam not found for uniqueParamString ${uniqueParamString}`,
      )
      return {
        result: UniqueParamVerificationResult.INVALID,
        displayData: null,
      }
    }
    // future extension: deal with expired uniqueParamString here
    // update operation can run as void because we don't use the result
    void this.uniqueParamsRepository.save({
      ...uniqueParamFromDb,
      numOfQueries: uniqueParamFromDb.numOfQueries + 1,
    })
    return {
      result: UniqueParamVerificationResult.VALID,
      displayData: uniqueParamFromDb.displayData,
    }
  }
}
