import { Injectable } from '@nestjs/common'
import { TypeOrmOptionsFactory, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'
import { join } from 'path'

import { ConfigService } from 'core/providers'

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private config: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.config.get('database.host'),
      port: this.config.get('database.port'),
      username: this.config.get('database.username'),
      password: this.config.get('database.password'),
      database: this.config.get('database.name'),
      logging: this.config.get('database.logging'),
      // https://docs.nestjs.com/techniques/database#auto-load-entities
      entities: [join(__dirname, 'entities', '*.entity.js')],
      synchronize: true, // TODO: remove in prod
      // ref: https://github.com/typeorm/typeorm/issues/3388 to set pool size
      extra: {
        min: this.config.get('database.minPool'),
        max: this.config.get('database.maxPool'),
      },
      namingStrategy: new SnakeNamingStrategy(),
    }
  }
}
