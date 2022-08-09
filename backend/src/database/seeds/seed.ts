/* eslint-disable no-console */
import { DataSource } from 'typeorm'

import { connectionConfig } from '../datasource'
import { Agency, MessageTemplate } from '../entities'

import { agenciesData } from './agenciesData'
import { messageTemplatesData } from './messageTemplatesData'

const createAgencies = async (dataSource: DataSource) => {
  dataSource
    .initialize()
    .then(async () => {
      console.log('Creating agencies...')
      for (const agencyData of agenciesData) {
        const agency = Object.assign(new Agency(), agencyData)
        await dataSource.manager.save(agency)
      }
    })
    .then(() => {
      console.log('Agencies created successfully!')
    })
    .catch((error) =>
      console.log(`Something went wrong while creating agencies!\n${error}`),
    )
}

const loadMessageTemplates = async (dataSource: DataSource) => {
  dataSource
    .initialize()
    .then(async () => {
      console.log('Loading message templates...')
      const messageTemplateRepo =
        dataSource.manager.getRepository(MessageTemplate)
      for (const messageTemplateData of messageTemplatesData) {
        console.log(`Creating message template: ${messageTemplateData.key}...`)
        const messageTemplate = messageTemplateRepo.create({
          ...messageTemplateData,
          agency: { id: messageTemplateData.agencyId },
        })
        try {
          await dataSource.manager.save(messageTemplate)
        } catch (e) {
          console.error(e)
        }
      }
    })
    .then(() => {
      console.log('Message templates loaded successfully!')
    })
    .catch((error) =>
      console.log(
        `Something went wrong while loading message templates!\n${error}`,
      ),
    )
}

const main = async () => {
  console.log('Seeding database...')
  try {
    const dataSource = new DataSource(connectionConfig)
    await createAgencies(dataSource)
    await loadMessageTemplates(dataSource)
  } catch (e) {
    console.error(e)
  }
}

void main()
