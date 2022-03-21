import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { AgenciesService } from 'agencies/agencies.service'
import { Agency, Officer } from 'database/entities'
import { OfficersController } from './officers.controller'
import { OfficersService } from './officers.service'

describe('OfficersController', () => {
  let controller: OfficersController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficersController],
      providers: [
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

    controller = module.get<OfficersController>(OfficersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
