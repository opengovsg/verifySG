import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AgenciesService } from '../../agencies/agencies.service'
import { CoreModule } from '../../core/core.module'
import { Logger } from '../../core/providers'
import {
  Agency,
  MessageTemplate,
  Notification,
  Officer,
  SGNotifyNotificationStatus,
} from '../../database/entities'
import { useTestDatabase } from '../../database/test-hooks'
import { MessageTemplatesService } from '../../message-templates/message-templates.service'
import { OfficersService } from '../../officers/officers.service'
import { NotificationsService } from '../notifications.service'
import { SGNotifyParams } from '../sgnotify/message-templates/message-template'
import { SGNotifyService } from '../sgnotify/sgnotify.service'

import { SendNotificationReqDto } from '~shared/types/api'
import { SGNotifyMessageTemplateId } from '~shared/utils'

describe('NotificationsService', () => {
  let service: NotificationsService
  let repository: Repository<Notification>
  let messageTemplatesService: MessageTemplatesService
  let messageTemplatesRepository: Repository<MessageTemplate>
  let officersService: OfficersService
  let officersRepository: Repository<Officer>
  let agenciesRepository: Repository<Agency>
  let sgNotifyService: SGNotifyService
  let logger: Logger
  let resetDatabase: () => Promise<void>
  let closeDatabase: () => Promise<void>

  const mockAgency: Agency = createMock<Agency>({
    id: 'SPF',
    name: 'Singapore Police Force',
    logoUrl: 'https://file.go.gov.sg/spf-logo.png',
    emailDomains: ['spf.gov.sg'],
  })

  const mockOfficer: Officer = createMock<Officer>({
    id: 1,
    email: 'benjamin_tan@spf.gov.sg',
    name: 'Benjamin Tan',
    position: 'Commissioner of Police',
    agency: mockAgency,
  })

  const mockMessageTemplate: MessageTemplate = createMock<MessageTemplate>({
    id: 1,
    key: 'template_key',
    agency: mockAgency,
    menu: 'Option description in menu',
    sgNotifyMessageTemplateParams: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details: 'Call details',
      },
    },
  })

  const mockSendNotificationReqDto: SendNotificationReqDto = {
    nric: 'S1234567D',
    msgTemplateKey: mockMessageTemplate.key,
  }

  const mockValidSGNotifyParams: SGNotifyParams = {
    agencyShortName: 'SPF',
    agencyLogoUrl: 'https://file.go.gov.sg/spf-logo.png',
    title: 'Notification title',
    shortMessage: 'Notification short message',
    nric: 'S1234567D',
    templateId:
      SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
    sgNotifyLongMessageParams: {
      param: 'value',
    },
    status: SGNotifyNotificationStatus.NOT_SENT,
  }

  beforeAll(async () => {
    const [opts, resetHook, closeHook] = await useTestDatabase()
    resetDatabase = resetHook
    closeDatabase = closeHook
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CoreModule,
        TypeOrmModule.forRootAsync(opts),
        TypeOrmModule.forFeature([
          Notification,
          MessageTemplate,
          Officer,
          Agency,
        ]),
      ],
      providers: [
        NotificationsService,
        MessageTemplatesService,
        OfficersService,
        SGNotifyService,
        AgenciesService,
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
    repository = module.get(getRepositoryToken(Notification))
    messageTemplatesService = module.get<MessageTemplatesService>(
      MessageTemplatesService,
    )
    messageTemplatesRepository = module.get(getRepositoryToken(MessageTemplate))
    officersService = module.get<OfficersService>(OfficersService)
    officersRepository = module.get(getRepositoryToken(Officer))
    agenciesRepository = module.get(getRepositoryToken(Agency))
    sgNotifyService = module.get<SGNotifyService>(SGNotifyService)
    logger = module.get<Logger>(Logger)
  })
  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()
    await agenciesRepository.save(Object.assign(new Agency(), mockAgency))
    await officersRepository.save(Object.assign(new Officer(), mockOfficer))
    await messageTemplatesRepository.save(
      Object.assign(new MessageTemplate(), mockMessageTemplate),
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
    expect(messageTemplatesService).toBeDefined()
    expect(messageTemplatesRepository).toBeDefined()
    expect(officersService).toBeDefined()
    expect(officersRepository).toBeDefined()
    expect(sgNotifyService).toBeDefined()
    expect(logger).toBeDefined()
  })
  describe('createNotification', () => {
    it('should create notification successfully', async () => {
      // TODO
    })
    // TODO: handle error cases
  })
  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const mockSGNotifySendSuccess = jest
        .spyOn(sgNotifyService, 'sendNotification')
        .mockResolvedValue({
          ...mockValidSGNotifyParams,
          requestId: '123456',
          sgNotifyLongMessageParams: {
            ...mockValidSGNotifyParams.sgNotifyLongMessageParams,
          },
          status: SGNotifyNotificationStatus.SENT_BY_SERVER,
        })
      await service.sendNotification(
        mockOfficer.id,
        mockAgency.id,
        mockSendNotificationReqDto,
      )
      expect(mockSGNotifySendSuccess).toHaveBeenCalled()
      mockSGNotifySendSuccess.mockRestore()
    })
  })
  // TODO: handle error cases
  describe('updateNotification', () => {
    it('should update notification successfully', async () => {
      // TODO
    })
    // TODO: handle error cases
  })
})
