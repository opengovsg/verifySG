import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import { Client } from 'pg'
import { DataSource } from 'typeorm'

import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { connectionConfig } from './datasource'

// hook for creating a container with a database connection for testing
export async function useTestDatabase(
  name?: string,
): Promise<
  [TypeOrmModuleAsyncOptions, () => Promise<void>, () => Promise<void>]
> {
  if (!name) {
    name = randomUUID()
  }

  await createDatabase(name)

  const testConfig: PostgresConnectionOptions = {
    ...connectionConfig,
    database: name,
    synchronize: true,
  }

  const datasource = new DataSource(testConfig)

  const opts: TypeOrmModuleAsyncOptions = {
    useFactory: () => ({}),
    dataSourceFactory: async () => datasource,
  }
  const resetHook = () => resetDatabase(datasource)
  const closeHook = () => datasource.destroy()
  return [opts, resetHook, closeHook]
}

async function createDatabase(name: string): Promise<void> {
  const { username: user, password, database, port, host } = connectionConfig
  const client = new Client({ user, database, password, port, host })
  try {
    await client.connect()
    await client.query(`CREATE DATABASE "${name}";`)
  } finally {
    await client.end()
  }
}

async function resetDatabase(datasource: DataSource) {
  const entities = datasource.entityMetadatas
  for (const entity of entities) {
    const repository = datasource.getRepository(entity.name)
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    )
  }
}
