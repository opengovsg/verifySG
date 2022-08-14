import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AgenciesService } from 'agencies/agencies.service'
import { Agency, Officer } from 'database/entities'

import { useTestDatabase } from '../../database/test-hooks'
import { OfficersService } from '../officers.service'

describe('OfficersService', () => {
  let service: OfficersService
  let repository: Repository<Officer>
  let agenciesService: AgenciesService
  let agenciesRepository: Repository<Agency>
  let resetDatabase: () => Promise<void>
  let closeDatabase: () => Promise<void>

  const mockOfficer: Officer = createMock<Officer>({
    email: 'benjamin_tan@spf.gov.sg',
    name: 'Benjamin Tan',
    position: 'Commissioner of Police',
  })

  const mockAgency: Agency = createMock<Agency>({
    id: 'SPF',
    name: 'Singapore Police Force',
    emailDomains: ['spf.gov.sg'],
  })

  beforeAll(async () => {
    const [opts, resetHook, closeHook] = await useTestDatabase()
    resetDatabase = resetHook
    closeDatabase = closeHook
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync(opts),
        // using both repositories for integration tests
        TypeOrmModule.forFeature([Officer, Agency]),
      ],
      providers: [OfficersService, AgenciesService],
    }).compile()

    service = module.get<OfficersService>(OfficersService)
    repository = module.get(getRepositoryToken(Officer))
    agenciesService = module.get<AgenciesService>(AgenciesService)
    agenciesRepository = module.get(getRepositoryToken(Agency))
  })

  afterAll(async () => {
    await closeDatabase()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
    expect(agenciesService).toBeDefined()
    expect(agenciesRepository).toBeDefined()
  })
})
