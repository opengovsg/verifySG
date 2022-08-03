/* eslint-disable no-console */
import { DataSource } from 'typeorm'
import { agenciesData } from './agenciesData'
import { connectionOptions } from '../datasource'
import { Agency } from '../entities'

const createAgencies = async (dataSource: DataSource) => {
  dataSource
    .initialize()
    .then(async () => {
      console.log('Creating agencies...')
      for (const agencyData of agenciesData) {
        const agency = new Agency()
        Object.assign(agency, agencyData)
        await dataSource.manager.save(agency)
      }
    })
    .then(() => {
      console.log('Agencies created successfully!')
    })
    .catch((error) => console.log(`Something went wrong!\n${error}`))
}

const main = async () => {
  console.log('Seeding database...')
  try {
    const dataSource = new DataSource(connectionOptions)
    await createAgencies(dataSource)
  } catch (e) {
    console.error(e)
  }
}

void main()
