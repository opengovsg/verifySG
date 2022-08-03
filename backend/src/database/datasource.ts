import 'dotenv/config'
import convict from 'convict'
import { join } from 'path'
import { DataSource } from 'typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

import { schema } from '../core/config.schema'

const config = convict(schema)

export const connectionOptions: PostgresConnectionOptions = {
  type: 'postgres',
  host: config.get('database.host'),
  port: config.get('database.port'),
  username: config.get('database.username'),
  password: config.get('database.password'),
  database: config.get('database.name'),
  logging: config.get('database.logging'),
  synchronize: false,
  // js for runtime, ts for typeorm cli
  entities: [join(__dirname, 'entities', '*.entity{.js,.ts}')],
  migrations: [join(__dirname, 'migrations', '*{.js,.ts}')],
  // ref: https://github.com/typeorm/typeorm/issues/3388 to set pool size
  extra: {
    min: config.get('database.minPool'),
    max: config.get('database.maxPool'),
  },
  namingStrategy: new SnakeNamingStrategy(),
}

export const AppDataSource = new DataSource(connectionOptions)
