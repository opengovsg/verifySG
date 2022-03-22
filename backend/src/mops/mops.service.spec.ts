import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Mop } from 'database/entities'
import { Connection } from 'typeorm'
import { MopsService } from './mops.service'

describe('MopsService', () => {
  let service: MopsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MopsService,
        {
          provide: getRepositoryToken(Mop),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
        {
          provide: Connection,
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
      ],
    }).compile()

    service = module.get<MopsService>(MopsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
