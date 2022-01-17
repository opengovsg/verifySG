import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'

import { AppModule } from './app.module'
import { ConfigService, Logger } from 'core/providers'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })
  app.useLogger(app.get(Logger))

  app.setGlobalPrefix('/api')
  app.set('trust proxy', 1)

  const config = app.get(ConfigService)
  await app.listen(config.get('port'))
}

bootstrap()
