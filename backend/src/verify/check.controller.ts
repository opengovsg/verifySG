import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { DisplayData } from '../database/entities'
import {
  UniqueParamService,
  UniqueParamVerificationResult,
} from '../notifications/unique-params/unique-param.service'

@Controller('check')
export class CheckController {
  constructor(private uniqueParamService: UniqueParamService) {}

  @Get('/sms/:uniqueParamString')
  async verifyUniqueParamString(
    @Param('uniqueParamString') uniqueParamString: string,
  ): Promise<DisplayData> {
    const { result, displayData } =
      await this.uniqueParamService.verifyUniqueParamString(uniqueParamString)
    if (result !== UniqueParamVerificationResult.VALID) {
      throw new NotFoundException(
        `Unique param string ${uniqueParamString} has either expired or does not exist`,
      )
    }
    if (!displayData) {
      // basically, if UniqueParamVerificationResult.VALID, displayData should always exist
      throw new InternalServerErrorException(
        `This should not happen, please contact the CheckWho team and give the unique param string ${uniqueParamString}`,
      )
    }
    return displayData
  }
}
