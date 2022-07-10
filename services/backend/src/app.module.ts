import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR } from '@nestjs/core'
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common'
import { values } from 'lodash'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { HelmetMiddleware } from 'common/middlewares/helmet.middleware'
import { SessionMiddleware } from 'common/middlewares/session.middleware'
import { MorganMiddleware } from 'common/middlewares/morgan.middleware'
import { AllExceptionsFilter } from 'common/filters/error-handler.filter'

import { ApiModule } from './api.module'
import { CoreModule } from 'core/core.module'

import { DatabaseConfigService } from 'database/db-config.service'

import {
  SentryModule as NestSentryModule,
  SentryInterceptor as NestSentryInterceptor,
} from '@ntegral/nestjs-sentry'

@Module({
  imports: [
    CoreModule,
    ApiModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend-govt', 'build'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
    NestSentryModule.forRoot({
      dsn: process.env.SENTRY_BACKEND_DSN,
      debug: true,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
      close: {
        enabled: true,
        timeout: 1000,
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]) => {
          const allErrors = errors.map((e) => values(e.constraints).join(', '))
          return new BadRequestException(allErrors.join(', '))
        },
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: new NestSentryInterceptor(),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply global middlewares
    consumer.apply(HelmetMiddleware, MorganMiddleware).forRoutes('*')
    consumer.apply(SessionMiddleware).forRoutes('/api/*')
  }
}
