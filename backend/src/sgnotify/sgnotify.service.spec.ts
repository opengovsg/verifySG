import { Test, TestingModule } from '@nestjs/testing'
import { SgnotifyService } from './sgnotify.service'

describe('SgnotifyService', () => {
  let service: SgnotifyService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SgnotifyService],
    }).compile()

    service = module.get<SgnotifyService>(SgnotifyService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
