import { createMock } from '@golevelup/ts-jest'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AgenciesService } from 'agencies/agencies.service'

import { AuthOfficerGuard } from '../../auth-officer/guards/auth-officer.guard'
import { OfficerInfoInterface } from '../../common/decorators'
import { OfficersController } from '../officers.controller'
import { OfficersService } from '../officers.service'

const mockOfficer = {
  id: 1,
  email: 'benjamin_tan@spf.gov.sg',
  name: 'Benjamin Tan',
  position: 'Commissioner of Police',
}

export const mockOfficerInfoDecoratorValid: OfficerInfoInterface = {
  officerId: mockOfficer.id,
  officerEmail: mockOfficer.email,
  officerAgency: 'SPF',
}

const mockOfficerInfoDecoratorInvalid: OfficerInfoInterface = {
  officerId: 123456,
  officerEmail: 'not_exist@spf.gov.sg',
  officerAgency: 'SPF',
}

describe('OfficersController', () => {
  let controller: OfficersController
  const mockAuthOfficerGuard = createMock<AuthOfficerGuard>()
  const mockOfficersService = {
    findById: jest.fn(async (id) => {
      if (id === mockOfficer.id) return Promise.resolve(mockOfficer)
      else throw new NotFoundException('Officer not found')
    }),
    mapToDto: jest.fn((officer) => {
      // strictly speaking, this is wrong, but OK for mocking controller (unsure)
      // in fact, mapToDto should be refactored out from service (since it's a static method) TODO
      if (officer === mockOfficer) return mockOfficer
    }),
    updateOfficer: jest.fn(async (id, _) => {
      if (id === mockOfficer.id) return Promise.resolve()
      else throw new Error(`Officer ${id} not found`)
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficersController],
      providers: [
        { provide: OfficersService, useValue: mockOfficersService },
        { provide: AgenciesService, useValue: {} },
      ],
    })
      .overrideGuard(AuthOfficerGuard)
      .useValue(mockAuthOfficerGuard)
      .compile()

    controller = module.get<OfficersController>(OfficersController)
  })

  afterEach(() => {
    mockOfficersService.findById.mockClear()
    mockOfficersService.mapToDto.mockClear()
    mockOfficersService.updateOfficer.mockClear()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should get officer by id', async () => {
    const officer = await controller.getOfficer(mockOfficerInfoDecoratorValid)
    expect(mockOfficersService.findById).toHaveBeenCalledWith(mockOfficer.id)
    expect(officer).toEqual(mockOfficer)
    expect(mockOfficersService.mapToDto).toHaveBeenCalledWith(mockOfficer)
  })

  it('should throw NotFoundException', async () => {
    await expect(
      controller.getOfficer(mockOfficerInfoDecoratorInvalid),
    ).rejects.toThrow(NotFoundException)
    expect(mockOfficersService.findById).toHaveBeenCalledWith(123456)
    expect(mockOfficersService.mapToDto).not.toHaveBeenCalled()
  })

  test('updateOfficer happy path', async () => {
    await controller.updateOfficer(mockOfficerInfoDecoratorValid, {
      name: mockOfficer.name,
      position: mockOfficer.position,
    })
    expect(mockOfficersService.updateOfficer).toHaveBeenCalledWith(
      mockOfficer.id,
      {
        name: mockOfficer.name,
        position: mockOfficer.position,
      },
    )
    expect(mockOfficersService.mapToDto).not.toHaveBeenCalled()
    expect(mockOfficersService.findById).not.toHaveBeenCalled()
  })

  test('updateOfficer unhappy path', async () => {
    await expect(
      controller.updateOfficer(mockOfficerInfoDecoratorInvalid, {
        name: mockOfficer.name,
        position: mockOfficer.position,
      }),
    ).rejects.toThrow(BadRequestException)
  })
})
