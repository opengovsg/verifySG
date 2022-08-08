import 'dotenv/config'

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'

import { ConfigService, Logger } from 'core/providers'

import { AppModule } from './app.module'

async function bootstrap() {
  await ConfigService.createEnvFileFromSystemsManager()
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  })
  app.useLogger(app.get(Logger))

  app.set('trust proxy', 1)
  const config = app.get(ConfigService)
  app.enableCors({
    origin: [config.get('frontendUrls.frontendGovtBase')],
    credentials: true,
  })
  await app.listen(config.get('port'))
}

bootstrap()
