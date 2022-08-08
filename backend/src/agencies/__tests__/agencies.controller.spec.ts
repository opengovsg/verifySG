import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AuthAdminModule } from 'auth-admin/auth-admin.module'
import { AuthAdminService } from 'auth-admin/auth-admin.service'
import { Agency } from 'database/entities'
import { AgenciesController } from '../agencies.controller'
import { AgenciesService } from '../agencies.service'

describe('AgencyController', () => {
  let controller: AgenciesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgenciesController],
      providers: [
        AgenciesService,
        {
          provide: getRepositoryToken(Agency),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
        {
          provide: AuthAdminModule,
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
        {
          provide: AuthAdminService,
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
      ],
    }).compile()

    controller = module.get<AgenciesController>(AgenciesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
