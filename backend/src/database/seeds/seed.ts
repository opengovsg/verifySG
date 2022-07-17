/* eslint-disable no-console */
import { Connection, ConnectionOptions, createConnection } from 'typeorm'
import { Agency } from '../entities'
import ormconfig from '../ormconfig'
import { agenciesData } from './agenciesData'

const createAgencies = async (connection: Connection) => {
  const agencyRepo = connection.manager.getRepository(Agency)

  console.log('Creating agencies...')
  for (const agency of agenciesData) {
    try {
      await agencyRepo.save({
        ...agency,
      })
    } catch (e) {
      console.error(e)
    }
  }
}

const main = async () => {
  console.log('Seeding database...')
  try {
    const connection = await createConnection(ormconfig as ConnectionOptions)
    await createAgencies(connection)

    console.log('Finished seeding database!')
  } catch (e) {
    console.error(e)
  }
}

void main()
