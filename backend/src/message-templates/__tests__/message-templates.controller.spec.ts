import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthOfficerGuard } from '../../auth-officer/guards/auth-officer.guard'
import { Agency, MessageTemplate } from '../../database/entities'
import { mockOfficerInfoDecoratorValid } from '../../officers/__tests__/officers.controller.spec'
import { MessageTemplatesController } from '../message-templates.controller'
import { MessageTemplatesService } from '../message-templates.service'

import { SGNotifyMessageTemplateId } from '~shared/utils'

const mockAgency = createMock<Agency>({
  id: 'SPF',
  name: 'Singapore Police Force',
  logoUrl: 'https://file.go.gov.sg/spf-logo.png',
  emailDomains: ['spf.gov.sg'],
})

const mockMessageTemplates: MessageTemplate[] = [
  createMock<MessageTemplate>({
    id: 1,
    key: 'template_key',
    agency: mockAgency,
    menu: 'Option description in menu',
    params: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
      longMessageParams: {
        call_details: 'Call details',
      },
    },
  }),
  createMock<MessageTemplate>({
    id: 2,
    key: 'template_key_2',
    agency: mockAgency,
    menu: 'Option description in menu',
    params: {
      templateId:
        SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
      longMessageParams: {
        call_details: 'Call details',
      },
    },
  }),
]

describe('MessageTemplatesController', () => {
  let controller: MessageTemplatesController
  const mockAuthOfficerGuard = createMock<AuthOfficerGuard>()
  const mockMessageTemplatesService = {
    getActiveMessageTemplatesByAgencyId: jest.fn((agencyId) => {
      if (agencyId === mockOfficerInfoDecoratorValid.officerAgency)
        return Promise.resolve(mockMessageTemplates)
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageTemplatesController],
      providers: [
        {
          provide: MessageTemplatesService,
          useValue: mockMessageTemplatesService,
        },
      ],
    })
      .overrideGuard(AuthOfficerGuard)
      .useValue(mockAuthOfficerGuard)
      .compile()

    controller = module.get<MessageTemplatesController>(
      MessageTemplatesController,
    )
  })

  afterEach(() => {
    mockMessageTemplatesService.getActiveMessageTemplatesByAgencyId.mockClear()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should receive mockMessageTemplates', async () => {
    const messageTemplates = await controller.getActiveMessageTemplatesByAgency(
      mockOfficerInfoDecoratorValid,
    )
    expect(messageTemplates).toEqual(mockMessageTemplates)
  })
})
