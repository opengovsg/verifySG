import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Agency } from 'database/entities'

import { AgenciesService } from '../agencies.service'

describe('AgenciesService', () => {
  let service: AgenciesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgenciesService,
        {
          provide: getRepositoryToken(Agency),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
      ],
    }).compile()

    service = module.get<AgenciesService>(AgenciesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
