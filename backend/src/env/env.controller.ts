import { Controller, Get } from '@nestjs/common'

import { ConfigService } from 'core/providers'

import { EnvResDto } from '~shared/types/api'

@Controller('env')
export class EnvController {
  constructor(private config: ConfigService) {}

  /**
   * Endpoint for frontend to call to retrieve env-related information
   */
  @Get()
  async getEnv(): Promise<EnvResDto> {
    const env = this.config.get('environment')
    const isDowntime = this.config.get('isDowntime')
    return { env, isDowntime }
  }
}
