import { Module, Global } from '@nestjs/common'

import { ConfigService, Logger } from './providers'

@Global()
@Module({
  providers: [ConfigService, Logger],
  exports: [ConfigService, Logger],
})
export class CoreModule {}
