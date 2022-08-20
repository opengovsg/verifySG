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
    await agenciesRepository.save(Object.assign(new Agency(), mockAgency))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(repository).toBeDefined()
    expect(agenciesService).toBeDefined()
    expect(agenciesRepository).toBeDefined()
  })

  test('createOfficerByEmail happy path', async () => {
    const newlyCreatedOfficer = await service.createOfficerByEmail(
      mockOfficer.email,
    )
    expect(newlyCreatedOfficer.email).toBe(mockOfficer.email)
    const officerFromRepo = await repository.findOne({
      where: { email: mockOfficer.email },
    })
    expect(officerFromRepo).not.toBeNull()
    // type casting is OK as null would be caught by previous expect statement
    expect((officerFromRepo as Officer).email).toBe(newlyCreatedOfficer.email)
  })

  test('createOfficerByEmail unhappy path', async () => {
    await agenciesRepository.remove(mockAgency)
    await expect(
      service.createOfficerByEmail(mockOfficer.email),
    ).rejects.toThrow(`No agency for ${mockOfficer.email} found`)
  })

  test('findOrInsertByEmail happy path', async () => {
    const mockCreateOfficerByEmail = jest.spyOn(service, 'createOfficerByEmail')
    const newlyCreatedOfficer = await service.findOrInsertByEmail(
      mockOfficer.email,
    )
    expect(newlyCreatedOfficer.email).toBe(mockOfficer.email)
    const foundOfficer = await service.findOrInsertByEmail(mockOfficer.email)
    expect(foundOfficer).toEqual(newlyCreatedOfficer)
    // second call of findOrInsertByEmail should only find (and not create) officer
    expect(mockCreateOfficerByEmail).toHaveBeenCalledTimes(1)
  })

  test('findById and findByEmail', async () => {
    const officer = await service.findOrInsertByEmail(mockOfficer.email)
    const foundById = await service.findById(officer.id)
    const foundByEmail = await service.findByEmail(officer.email)
    expect(foundById).toEqual(officer)
    expect(foundById).toEqual(foundByEmail)
    const nonexistentOfficer = await service.findByEmail('ben@open.gov.sg')
    const nonexistentOfficer2 = await service.findById(123456)
    expect(nonexistentOfficer).toBeNull()
    expect(nonexistentOfficer2).toBeNull()
  })

  test('updateOfficer happy path', async () => {
    const officer = await service.findOrInsertByEmail(mockOfficer.email)
    const preUpdateOfficer = (await service.findById(officer.id)) as Officer
    expect(preUpdateOfficer.name).toBeNull()
    expect(preUpdateOfficer.position).toBeNull()
    await service.updateOfficer(officer.id, {
      name: mockOfficer.name,
      position: mockOfficer.position,
    })
    const updatedOfficer = (await service.findById(officer.id)) as Officer
    expect(updatedOfficer.name).toBe(mockOfficer.name)
    expect(updatedOfficer.position).toBe(mockOfficer.position)
  })

  it('should throw officer not found', async () => {
    const nonexistentId = 123456
    await expect(
      service.updateOfficer(nonexistentId, {
        name: mockOfficer.name,
        position: mockOfficer.position,
      }),
    ).rejects.toThrow(`Officer ${nonexistentId} not found`)
  })
})
