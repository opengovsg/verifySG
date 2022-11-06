import { createMock } from '@golevelup/ts-jest'
import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CoreModule } from 'core/core.module'
import { Agency, MessageTemplate } from 'database/entities'
import { useTestDatabase } from 'database/test-hooks'
import { MessageTemplatesService } from 'message-templates/message-templates.service'

import { SGNotifyMessageTemplateId } from '../../../../shared/src/utils'

import { MessageTemplateType } from '~shared/types/api'

export const mockAgency: Agency = createMock<Agency>({
  id: 'SPF',
  name: 'Singapore Police Force',
  logoUrl: 'https://file.go.gov.sg/spf-logo.png',
  emailDomains: ['spf.gov.sg'],
})

export const mockMessageTemplate: MessageTemplate = createMock<MessageTemplate>(
  {
    id: 1,
    key: 'template_key',
    agency: mockAgency,
    menu: 'Option description in menu',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details: 'Call details',
      },
    },
  },
)
export const mockMessageTemplateNotInDb: MessageTemplate =
  createMock<MessageTemplate>({
    id: 2,
    key: 'template_key_not_in_db',
  })

export const mockAnotherAgency: Agency = createMock<Agency>({
  id: 'IRAS',
  name: 'Inland Revenue Authority of Singapore',
  emailDomains: ['iras.gov.sg'],
})
export const mockMessageTemplateAnotherAgency: MessageTemplate =
  createMock<MessageTemplate>({
    id: 3,
    key: 'template_key_another_agency',
    agency: mockAnotherAgency,
    menu: 'some menu',
    type: MessageTemplateType.SGNOTIFY,
    params: {
      type: MessageTemplateType.SGNOTIFY,
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
      longMessageParams: {
        call_details: 'blah',
      },
    },
  })

describe('MessageTemplatesService', () => {
  let service: MessageTemplatesService
  let repository: Repository<MessageTemplate>
  let agenciesRepository: Repository<Agency>
  let resetDatabase: () => Promise<void>
  let closeDatabase: () => Promise<void>

  beforeAll(async () => {
    const [opts, resetHook, closeHook] = await useTestDatabase()
    resetDatabase = resetHook
    closeDatabase = closeHook
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CoreModule,
        TypeOrmModule.forRootAsync(opts),
        TypeOrmModule.forFeature([MessageTemplate, Agency]),
      ],
      providers: [MessageTemplatesService],
    }).compile()

    service = module.get<MessageTemplatesService>(MessageTemplatesService)
    repository = module.get(getRepositoryToken(MessageTemplate))
    agenciesRepository = module.get(getRepositoryToken(Agency))
  })

  afterAll(async () => {
    await closeDatabase()
  })

  afterEach(async () => {
    await resetDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()
    await agenciesRepository.save(Object.assign(new Agency(), mockAgency))
    await repository.save(
      Object.assign(new MessageTemplate(), mockMessageTemplate),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
    expect(agenciesRepository).toBeDefined()
  })

  describe('isMessageTemplateValidByAgencyId', () => {
    test('message template is valid', async () => {
      expect(
        await service.isMessageTemplateValidByAgencyId(
          mockMessageTemplate.key,
          mockAgency.id,
        ),
      ).toBe(true)
    })
    test('message template not in db is not valid', async () => {
      expect(
        await service.isMessageTemplateValidByAgencyId(
          mockMessageTemplateNotInDb.key,
          mockAgency.id,
        ),
      ).toBe(false)
    })
    test('message template of another agency is not valid', async () => {
      await agenciesRepository.save(
        Object.assign(new Agency(), mockAnotherAgency),
      )
      await repository.save(
        Object.assign(new MessageTemplate(), mockMessageTemplateAnotherAgency),
      )
      expect(
        await service.isMessageTemplateValidByAgencyId(
          mockMessageTemplateAnotherAgency.key,
          mockAgency.id,
        ),
      ).toBe(false)
      expect(
        await service.isMessageTemplateValidByAgencyId(
          mockMessageTemplate.key,
          mockAnotherAgency.id,
        ),
      ).toBe(false)
    })
  })

  describe('getMessageTemplatesByAgencyId', () => {
    test('dto is correct', async () => {
      const receivedDto = await service.getMessageTemplatesByAgencyId(
        mockAgency.id,
      )
      expect(receivedDto).toEqual([
        {
          key: mockMessageTemplate.key,
          menu: mockMessageTemplate.menu,
          params: mockMessageTemplate.params,
          type: mockMessageTemplate.type,
        },
      ])
    })
    test('dto is correct even if agency has no message templates', async () => {
      await repository.delete(mockMessageTemplate.id)
      const receivedDto = await service.getMessageTemplatesByAgencyId(
        mockAgency.id,
      )
      expect(receivedDto).toEqual([])
    })
  })

  describe('getSGNotifyMessageTemplateParams', () => {
    test('happy path', async () => {
      expect(
        await service.getMessageTemplateParams(mockMessageTemplate.key),
      ).toEqual({
        id: mockMessageTemplate.id,
        params: mockMessageTemplate.params,
      })
    })
    test('message template not in db', async () => {
      await expect(
        service.getMessageTemplateParams(mockMessageTemplateNotInDb.key),
      ).rejects.toEqual(
        new BadRequestException(
          `MessageTemplate with key ${mockMessageTemplateNotInDb.key} does not exist`,
        ),
      )
    })
  })
})
