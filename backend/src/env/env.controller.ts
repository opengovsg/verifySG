import { Controller, Get } from '@nestjs/common'
import { ConfigService } from 'core/providers'
import { EnvDto } from '~shared/types'

@Controller('env')
export class EnvController {
  constructor(private config: ConfigService) {}

  /**
   * Endpoint for frontend to call to retrieve frontend Sentry DSN
   */
  @Get()
  async getEnv(): Promise<EnvDto> {
    const { frontendDsn } = this.config.get('sentry')
    const env = this.config.get('environment')
    return { dsn: frontendDsn, env }
  }
}
