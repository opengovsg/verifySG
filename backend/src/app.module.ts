import {
  BadRequestException,
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { values } from 'lodash'
import { join } from 'path'

import { AllExceptionsFilter } from 'common/filters/error-handler.filter'
import { HelmetMiddleware } from 'common/middlewares/helmet.middleware'
import { MorganMiddleware } from 'common/middlewares/morgan.middleware'
import { SessionMiddleware } from 'common/middlewares/session.middleware'
import { CoreModule } from 'core/core.module'
import { connectionConfig } from 'database/datasource'

import { ApiModule } from './api.module'

@Module({
  imports: [
    CoreModule,
    ApiModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend-govt', 'build'),
      exclude: ['/api*'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => connectionConfig,
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
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply global middlewares
    consumer.apply(HelmetMiddleware, MorganMiddleware).forRoutes('*')
    consumer.apply(SessionMiddleware).forRoutes('/api/*')
  }
}
