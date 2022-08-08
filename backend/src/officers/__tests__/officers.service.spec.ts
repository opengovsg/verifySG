import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { AgenciesService } from 'agencies/agencies.service'
import { Agency, Officer } from 'database/entities'

import { OfficersService } from '../officers.service'

describe('OfficersService', () => {
  let service: OfficersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<OfficersService>(OfficersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
