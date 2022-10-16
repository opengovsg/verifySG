import { createMock } from '@golevelup/ts-jest'
import { BadRequestException } from '@nestjs/common'
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
  NotificationStatus,
  NotificationType,
  Officer,
  SGNotifyNotificationStatus,
} from '../../database/entities'
import { useTestDatabase } from '../../database/test-hooks'
import { mockMessageTemplateNotInDb } from '../../message-templates/__tests__/message-templates.service.spec'
import { MessageTemplatesService } from '../../message-templates/message-templates.service'
import { OfficersService } from '../../officers/officers.service'
import {
  INVALID_MESSAGE_TEMPLATE,
  NOTIFICATION_REQUEST_ERROR_MESSAGE,
  OFFICER_NAME_AND_POSITION,
  OFFICER_NOT_FOUND,
} from '../constants'
import { NotificationsService } from '../notifications.service'
import { SGNotifyParams } from '../sgnotify/message-templates/message-template'
import { SGNotifyService } from '../sgnotify/sgnotify.service'

import { SendNotificationReqDto } from '~shared/types/api'
import { SGNotifyMessageTemplateId } from '~shared/utils'

export const mockValidSGNotifyParams: SGNotifyParams = {
  agencyShortName: 'SPF',
  agencyLogoUrl: 'https://file.go.gov.sg/spf-logo.png',
  title: 'Notification title',
  shortMessage: 'Notification short message',
  nric: 'S1234567D',
  templateId: SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
  sgNotifyLongMessageParams: {
    param: 'value',
  },
  status: SGNotifyNotificationStatus.NOT_SENT,
}

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
    test('create notification happy path', async () => {
      const createdNotification = await service.createNotification(
        mockOfficer.id,
        mockOfficer.agency.id,
        mockSendNotificationReqDto,
      )
      // this passes even for partial match; thus not all fields are added
      expect(createdNotification).toMatchObject({
        id: expect.any(Number),
        notificationType: NotificationType.SGNOTIFY,
        status: SGNotifyNotificationStatus.NOT_SENT,
        recipientId: mockSendNotificationReqDto.nric,
        modalityParams: {
          agencyLogoUrl: mockAgency.logoUrl,
          agencyShortName: mockAgency.id,
          nric: mockSendNotificationReqDto.nric,
          templateId:
            mockMessageTemplate.sgNotifyMessageTemplateParams.templateId,
          sgNotifyLongMessageParams: {
            agency: mockAgency.name,
            call_details:
              mockMessageTemplate.sgNotifyMessageTemplateParams
                .longMessageParams.call_details,
            officer_name: `<u>${mockOfficer.name}</u>`,
            position: `<u>${mockOfficer.position}</u>`,
          },
        },
        messageTemplate: {
          id: mockMessageTemplate.id,
          key: mockMessageTemplate.key,
          menu: mockMessageTemplate.menu,
          sgNotifyMessageTemplateParams: {
            longMessageParams: {
              call_details:
                mockMessageTemplate.sgNotifyMessageTemplateParams
                  .longMessageParams.call_details,
            },
            templateId:
              mockMessageTemplate.sgNotifyMessageTemplateParams.templateId,
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          deletedAt: null,
        },
        officer: {
          id: mockOfficer.id,
          email: mockOfficer.email,
          name: mockOfficer.name,
          position: mockOfficer.position,
          agency: {
            id: mockAgency.id,
            name: mockAgency.name,
            logoUrl: mockAgency.logoUrl,
            emailDomains: mockAgency.emailDomains,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          },
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
      })
    })
    test('message template not in db', async () => {
      const mockSendNotificationReqDtoNotInDb: SendNotificationReqDto = {
        nric: 'S1234567D',
        msgTemplateKey: mockMessageTemplateNotInDb.key,
      }
      await expect(
        service.createNotification(
          mockOfficer.id,
          mockOfficer.agency.id,
          mockSendNotificationReqDtoNotInDb,
        ),
      ).rejects.toEqual(new BadRequestException(INVALID_MESSAGE_TEMPLATE))
    })
    test('message template belongs to another agency', async () => {
      const mockAnotherAgency: Agency = createMock<Agency>({
        id: 'IRAS',
        name: 'Inland Revenue Authority of Singapore',
        emailDomains: ['iras.gov.sg'],
      })
      const mockMessageTemplateAnotherAgency: MessageTemplate =
        createMock<MessageTemplate>({
          id: 3,
          key: 'template_key_another_agency',
          agency: mockAnotherAgency,
          menu: 'some menu',
          sgNotifyMessageTemplateParams: {
            templateId:
              SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
            longMessageParams: {
              call_details: 'blah',
            },
          },
        })
      const mockSendNotificationReqDtoAnotherAgency: SendNotificationReqDto = {
        nric: 'S1234567D',
        msgTemplateKey: mockMessageTemplateAnotherAgency.key,
      }
      await agenciesRepository.save(
        Object.assign(new Agency(), mockAnotherAgency),
      )
      await messageTemplatesRepository.save(
        Object.assign(new MessageTemplate(), mockMessageTemplateAnotherAgency),
      )
      await expect(
        service.createNotification(
          mockOfficer.id,
          mockOfficer.agency.id,
          mockSendNotificationReqDtoAnotherAgency,
        ),
      ).rejects.toEqual(new BadRequestException(INVALID_MESSAGE_TEMPLATE))
    })
    it('should throw error officer not found', async () => {
      await expect(
        service.createNotification(
          mockOfficer.id + 123456,
          mockOfficer.agency.id,
          mockSendNotificationReqDto,
        ),
      ).rejects.toEqual(new BadRequestException(OFFICER_NOT_FOUND))
    })
    it('should throw error officer does not have name and position', async () => {
      const mockOfficerWithoutNamePosition: Officer = createMock<Officer>({
        id: 2,
        email: 'benjamin_tan2@spf.gov.sg',
        name: '',
        position: '',
        agency: mockAgency,
      })
      await officersRepository.save(
        Object.assign(new Officer(), mockOfficerWithoutNamePosition),
      )
      await expect(
        service.createNotification(
          mockOfficerWithoutNamePosition.id,
          mockOfficerWithoutNamePosition.agency.id,
          mockSendNotificationReqDto,
        ),
      ).rejects.toEqual(new BadRequestException(OFFICER_NAME_AND_POSITION))
    })
  })
  it('invalid SGNotifyParams: unsupported SGNotify template', async () => {
    const mockMessageTemplateInvalidSGNotifyTemplate =
      createMock<MessageTemplate>({
        key: 'template_key_invalid_sgnotify_template',
        agency: mockAgency,
        menu: 'some menu',
        sgNotifyMessageTemplateParams: {
          templateId:
            'unsupported_SGNotify_template' as SGNotifyMessageTemplateId,
          longMessageParams: {
            call_details: 'blah',
          },
        },
      })
    await messageTemplatesRepository.save(
      Object.assign(
        new MessageTemplate(),
        mockMessageTemplateInvalidSGNotifyTemplate,
      ),
    )
    jest.spyOn(logger, 'error')
    await expect(
      service.createNotification(mockOfficer.id, mockOfficer.agency.id, {
        nric: 'S1234567D',
        msgTemplateKey: mockMessageTemplateInvalidSGNotifyTemplate.key,
      }),
    ).rejects.toEqual(
      new BadRequestException(NOTIFICATION_REQUEST_ERROR_MESSAGE),
    )
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        `templateId: ${mockMessageTemplateInvalidSGNotifyTemplate.sgNotifyMessageTemplateParams.templateId}`,
      ),
    )
  })
  it('invalid SGNotifyParams: agency name too long', async () => {
    const mockAgencyNameTooLong: Agency = createMock<Agency>({
      id: 'MINISTRY OF SOCIAL AND FAMILY DEVELOPMENT FILLER FILLER FILLER FILLER', // need to be all caps because of db constraint
      name: 'Ministry of Social and Family Development',
      emailDomains: ['msf.gov.sg'],
      logoUrl: 'https://file.go.gov.sg/msf-logo.png',
    })
    const mockMSFOfficer: Officer = createMock<Officer>({
      id: 2,
      email: 'benjamin_tan@msf.gov.sg',
      name: 'Benjamin Tan',
      position: 'Commissioner of Police',
      agency: mockAgencyNameTooLong,
    })

    const mockMSFMessageTemplate: MessageTemplate = createMock<MessageTemplate>(
      {
        id: 2,
        key: 'msf_template_key',
        agency: mockAgencyNameTooLong,
        menu: 'Option description in menu',
        sgNotifyMessageTemplateParams: {
          templateId:
            SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
          longMessageParams: {
            call_details: 'Call details',
          },
        },
      },
    )
    await agenciesRepository.save(
      Object.assign(new Agency(), mockAgencyNameTooLong),
    )
    await officersRepository.save(Object.assign(new Officer(), mockMSFOfficer))
    await messageTemplatesRepository.save(
      Object.assign(new MessageTemplate(), mockMSFMessageTemplate),
    )
    jest.spyOn(logger, 'error')
    await expect(
      service.createNotification(mockMSFOfficer.id, mockMSFOfficer.agency.id, {
        nric: 'S1234567D',
        msgTemplateKey: mockMSFMessageTemplate.key,
      }),
    ).rejects.toEqual(
      new BadRequestException(NOTIFICATION_REQUEST_ERROR_MESSAGE),
    )
    expect(logger.error).toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('Invalid parameters in notification request'),
    )
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
    // honestly, cannot conceive how this would happen; would throw error instead
    test('throw error if insertion fails somehow', async () => {
      const mockCreateNotificationReturnNull = jest
        .spyOn(service, 'createNotification')
        .mockResolvedValue(null)
      await expect(
        service.sendNotification(
          mockOfficer.id,
          mockAgency.id,
          mockSendNotificationReqDto,
        ),
      ).rejects.toEqual(new BadRequestException('Notification not created'))
      mockCreateNotificationReturnNull.mockRestore()
    })
  })

  describe('updateNotification', () => {
    it('should update notification successfully', async () => {
      // able to use this since earlier tests passed
      const createdNotification = await service.createNotification(
        mockOfficer.id,
        mockOfficer.agency.id,
        mockSendNotificationReqDto,
      )
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
      const modalityParamsUpdated = await sgNotifyService.sendNotification(
        (createdNotification as Notification).modalityParams,
      )
      const updatedNotification = await service.updateNotification(
        (createdNotification as Notification).id,
        modalityParamsUpdated,
      )
      expect(updatedNotification.status).toEqual(NotificationStatus.SENT)
      expect(updatedNotification.modalityParams).toEqual(modalityParamsUpdated)
      mockSGNotifySendSuccess.mockRestore()
    })
    test('throw error if findById fails somehow', async () => {
      const createdNotification = await service.createNotification(
        mockOfficer.id,
        mockOfficer.agency.id,
        mockSendNotificationReqDto,
      )
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
      const modalityParamsUpdated = await sgNotifyService.sendNotification(
        (createdNotification as Notification).modalityParams,
      )
      const mockFindByIdReturnNull = jest
        .spyOn(service, 'findById')
        .mockResolvedValue(null)
      await expect(
        service.updateNotification(
          (createdNotification as Notification).id,
          modalityParamsUpdated,
        ),
      ).rejects.toEqual(
        new BadRequestException(
          `Notification ${(createdNotification as Notification).id} not found`,
        ),
      )
      mockSGNotifySendSuccess.mockRestore()
      mockFindByIdReturnNull.mockRestore()
    })
  })
})
