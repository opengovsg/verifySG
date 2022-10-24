import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthOfficerGuard } from '../../auth-officer/guards/auth-officer.guard'
import { OfficerInfoInterface } from '../../common/decorators'
import { NotificationsController } from '../notifications.controller'
import { NotificationsService } from '../notifications.service'

import { SendNotificationReqDto } from '~shared/types/api'

const mockOfficerInfoDecorator: OfficerInfoInterface = {
  officerId: 1,
  officerEmail: 'benjamin_tan@spf.gov.sg',
  officerAgency: 'SPF',
}

const mockSendNotificationReqDto: SendNotificationReqDto = {
  nric: 'S1234567D',
  msgTemplateKey: 'template_key',
}

describe('NotificationsController', () => {
  let controller: NotificationsController
  const mockAuthOfficerGuard = createMock<AuthOfficerGuard>()
  const mockNotificationsService = {
    sendNotification: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    })
      .overrideGuard(AuthOfficerGuard)
      .useValue(mockAuthOfficerGuard)
      .compile()

    controller = module.get<NotificationsController>(NotificationsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should call sendNotification', async () => {
    await controller.sendNotification(
      mockOfficerInfoDecorator,
      mockSendNotificationReqDto,
    )
    expect(mockNotificationsService.sendNotification).toHaveBeenCalledWith(
      mockOfficerInfoDecorator.officerId,
      mockOfficerInfoDecorator.officerAgency,
      mockSendNotificationReqDto,
    )
  })
})
