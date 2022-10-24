// TODO: write actual tests later
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CoreModule } from '../../core/core.module'
import { Logger } from '../../core/providers'
import { UniqueParam } from '../../database/entities'
import { useTestDatabase } from '../../database/test-hooks'
import { UniqueParamService } from '../unique-param.service'

describe('UniqueParamService', () => {
  let service: UniqueParamService
  let uniqueParamRepository: Repository<UniqueParam>
  let logger: Logger
  let resetDatabase: () => Promise<void>
  let closeDatabase: () => Promise<void>

  beforeAll(async () => {
    const [opts, resetHook, closeHook] = await useTestDatabase()
    resetDatabase = resetHook
    closeDatabase = closeHook
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CoreModule,
        TypeOrmModule.forRootAsync(opts),
        TypeOrmModule.forFeature([UniqueParam]),
      ],
      providers: [UniqueParamService],
    }).compile()

    service = module.get<UniqueParamService>(UniqueParamService)
    uniqueParamRepository = module.get(getRepositoryToken(UniqueParam))
    logger = module.get<Logger>(Logger)
  })

  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(uniqueParamRepository).toBeDefined()
    expect(logger).toBeDefined()
  })
})
