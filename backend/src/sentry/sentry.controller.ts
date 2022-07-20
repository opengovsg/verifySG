import { Controller, Get } from '@nestjs/common'
import { ConfigService } from 'core/providers'

@Controller('env')
export class SentryController {
  constructor(private config: ConfigService) {}

  /**
   * Endpoint for frontend to call to retrieve frontend Sentry DSN
   */
  @Get()
  async getSentryFrontendDsn(): Promise<{
    dsn: string
    env: 'development' | 'staging' | 'production' | 'test'
  }> {
    const { frontendDsn } = this.config.get('sentry')
    const env = this.config.get('environment')
    return { dsn: frontendDsn, env }
  }
}
