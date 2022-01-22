import { Test, TestingModule } from '@nestjs/testing'
import { MopsService } from './mops.service'

describe('MopsService', () => {
  let service: MopsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MopsService],
    }).compile()

    service = module.get<MopsService>(MopsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
