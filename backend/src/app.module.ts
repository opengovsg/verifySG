import { APP_FILTER } from '@nestjs/core'
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'

import { HelmetMiddleware } from 'common/middlewares/helmet.middleware'
import { SessionMiddleware } from 'common/middlewares/session.middleware'
import { MorganMiddleware } from 'common/middlewares/morgan.middleware'
import { AllExceptionsFilter } from 'common/filters/error-handler.filter'

import { HealthModule } from 'health/health.module'
import { CoreModule } from 'core/core.module'

import { DatabaseConfigService } from 'database/db-config.service'

@Module({
  imports: [
    CoreModule,
    HealthModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'build'),
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply global middlewares
    consumer
      .apply(HelmetMiddleware, SessionMiddleware, MorganMiddleware)
      .forRoutes('*')
  }
}
