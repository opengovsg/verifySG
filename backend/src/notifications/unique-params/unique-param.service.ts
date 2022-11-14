import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ConfigSchema } from '../../core/config.schema'
import { ConfigService, Logger } from '../../core/providers'
import { DisplayData, UniqueParam } from '../../database/entities'

import { generateUniqueParamString } from './unique-param-utils'

export enum UniqueParamVerificationResult {
  VALID = 'valid', // exists in db and is valid
  EXPIRED = 'expired', // exists in db but has expired
  NONEXISTENT = 'nonexistent', // does not exist in db
}

@Injectable()
export class UniqueParamService {
  private readonly config: ConfigSchema['uniqueParams']
  constructor(
    @InjectRepository(UniqueParam)
    private uniqueParamsRepository: Repository<UniqueParam>,
    private configService: ConfigService,
    private logger: Logger,
  ) {
    this.config = this.configService.get('uniqueParams')
  }

  async generateUniqueParam(
    displayData: DisplayData,
    expiryPeriodSeconds?: number | null,
  ): Promise<string> {
    let uniqueParamString
    do {
      uniqueParamString = generateUniqueParamString()
    } while (await this.uniqueParamStringExists(uniqueParamString))
    /* Intended behavior:
     * Expiry period is in milliseconds
     * 1. If no expiry period is provided (undefined), default expiry period as defined in env var will be applied
     * 2. If expiry period is provided, it will override the default expiry period
     * 3. API user can also pass in null to explicitly indicate the uniqueParamString should not expire
     * */
    const expiredAt =
      expiryPeriodSeconds === null
        ? null
        : new Date(
            Date.now() +
              // if expiryPeriodSeconds is undefined, use default expiry period
              (expiryPeriodSeconds ?? this.config.defaultExpiryPeriod),
          )
    const uniqueParamToAdd = this.uniqueParamsRepository.create({
      uniqueParamString,
      displayData,
      expiredAt,
    })
    await this.uniqueParamsRepository.save(uniqueParamToAdd)
    return uniqueParamString
  }

  async uniqueParamStringExists(uniqueParamString: string): Promise<boolean> {
    const uniqueParamFromDb = await this.uniqueParamsRepository.findOne({
      where: {
        uniqueParamString,
      },
    })
    return !!uniqueParamFromDb
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
        result: UniqueParamVerificationResult.NONEXISTENT,
        displayData: null,
      }
    }
    const { expiredAt } = uniqueParamFromDb
    // if expiredAt is null, expiry check is skipped
    if (expiredAt && expiredAt < new Date()) {
      this.logger.warn(
        `Queried uniqueParamString ${uniqueParamString} has expired`,
      )
      return {
        result: UniqueParamVerificationResult.EXPIRED,
        displayData: null,
      }
    }
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
