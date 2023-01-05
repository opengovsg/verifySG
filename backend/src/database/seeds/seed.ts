/* eslint-disable no-console */
import { DataSource } from 'typeorm'

import { connectionConfig } from '../datasource'
import { Agency, MessageTemplate } from '../entities'

import { agenciesData } from './agencies-data'
import { messageTemplatesData } from './message-templates-data'

const createAgencies = async (dataSource: DataSource) => {
  console.log('Attempting to create agencies...')
  for (const agencyData of agenciesData) {
    const agency = Object.assign(new Agency(), agencyData)
    await dataSource.manager
      .save(agency)
      .catch((error) =>
        console.log(
          `Something went wrong while creating agency ${agency.name}: ${error}`,
        ),
      )
  }
  console.log('Finished creating agencies.')
}

const loadMessageTemplates = async (dataSource: DataSource) => {
  console.log('Attempting to load message templates...')
  const messageTemplateRepo = dataSource.manager.getRepository(MessageTemplate)
  for (const messageTemplateData of messageTemplatesData) {
    const templateExists = await messageTemplateRepo.findOneBy({
      key: messageTemplateData.key,
    })
    if (templateExists) {
      console.log(`Skipping ${templateExists.key} as it already exists.`)
      continue
    }
    console.log(`Loading message template: ${messageTemplateData.key}...`)
    const messageTemplate = messageTemplateRepo.create({
      ...messageTemplateData,
      agency: { id: messageTemplateData.agencyId },
    })
    await dataSource.manager
      .save(messageTemplate)
      .catch((error) =>
        console.log(
          `Something went wrong while creating ${messageTemplate.key}: ${error}`,
        ),
      )
  }
}

const main = async () => {
  console.log('Seeding database...')
  try {
    const dataSource = new DataSource(connectionConfig)
    await dataSource.initialize()
    await createAgencies(dataSource) // to skip when we only want to add new message templates
    await loadMessageTemplates(dataSource)
  } catch (e) {
    console.error(e)
  }
}

void main()
