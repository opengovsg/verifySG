import { createConnection } from 'typeorm'
import { ConnectionOptions } from 'typeorm/connection/ConnectionOptions'

import { schema } from 'core/config.schema'
import convict from 'convict'
import { join } from 'path'

const config = convict(schema)

export const prepareDbConnections = async (): Promise<void> => {
  const connection = await createConnection({
    type: 'postgres',
    username: config.get('database.username'),
    password: config.get('database.password'),
    database: config.get('database.name'),
    host: config.get('database.host'),
    port: config.get('database.port'),
    logging: config.get('database.logging'),
  } as ConnectionOptions)
  const databaseName = `checkwho_test_template`
  const workers = config.get('jest.workers')

  await connection.query(`DROP DATABASE IF EXISTS ${databaseName}`)
  await connection.query(`CREATE DATABASE ${databaseName}`)

  const templateDBConnection = await createConnection({
    name: 'templateConnection',
    type: 'postgres',
    username: config.get('database.username'),
    password: config.get('database.password'),
    database: 'checkwho_test_template',
    host: config.get('database.host'),
    port: config.get('database.port'),
    entities: [join(__dirname, 'entities', '*.entity{.js,.ts}')],
    migrations: [join(__dirname, 'migrations', '*{.js,.ts}')],
  })

  await templateDBConnection.runMigrations()
  await templateDBConnection.close()

  for (let i = 1; i <= workers; i++) {
    const workerDatabaseName = `checkwho_test_${i}`

    await connection.query(`DROP DATABASE IF EXISTS ${workerDatabaseName};`)
    await connection.query(
      `CREATE DATABASE ${workerDatabaseName} TEMPLATE ${databaseName};`,
    )
  }

  await connection.close()
}
