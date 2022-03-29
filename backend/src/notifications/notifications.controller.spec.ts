import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Agency, Notification, Officer } from '../database/entities'
import { OfficersService } from '../officers/officers.service'
import { AgenciesService } from '../agencies/agencies.service'

describe('NotificationsController', () => {
  let controller: NotificationsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
        OfficersService,
        {
          provide: getRepositoryToken(Officer),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
        AgenciesService,
        {
          provide: getRepositoryToken(Agency),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
      ],
    }).compile()

    controller = module.get<NotificationsController>(NotificationsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
