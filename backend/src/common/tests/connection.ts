// modelled after https://dev.to/caiulucas/tests-with-jest-and-typeorm-4j1l
import { createConnection, getConnection } from 'typeorm'

import { schema } from 'core/config.schema'
import convict from 'convict'
import { join } from 'path'
import { SnakeNamingStrategy } from 'typeorm-naming-strategies'

const config = convict(schema)

const connection = {
  async create(): Promise<void> {
    await createConnection({
      type: 'postgres',
      host: config.get('database.host'),
      port: config.get('database.port'),
      username: config.get('database.username'),
      password: config.get('database.password'),
      database: config.get('database.name'),
      entities: [join(__dirname, 'entities', '*.entity{.js,.ts}')],
      migrations: [join(__dirname, 'migrations', '*{.js,.ts}')],
      namingStrategy: new SnakeNamingStrategy(),
    })
  },

  async close(): Promise<void> {
    await getConnection().close()
  },

  async clear(): Promise<void> {
    const connection = getConnection()
    const entities = connection.entityMetadatas

    for (const entity of entities) {
      const repository = connection.getRepository(entity.name)
      await repository.clear()
    }
  },
}
export default connection
