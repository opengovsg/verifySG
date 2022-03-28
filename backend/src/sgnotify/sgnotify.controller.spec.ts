import { Test, TestingModule } from '@nestjs/testing'
import { SgnotifyController } from './sgnotify.controller'

describe('SgnotifyController', () => {
  let controller: SgnotifyController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SgnotifyController],
    }).compile()

    controller = module.get<SgnotifyController>(SgnotifyController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
