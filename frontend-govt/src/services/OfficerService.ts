import { OfficerDto, UpdateOfficerDto } from '../types'

import { ApiService } from './ApiService'

const getOfficer = async (): Promise<OfficerDto> => {
  return await ApiService.get('/officers')
}

const updateOfficer = async (
  officerProfile: UpdateOfficerDto,
): Promise<OfficerDto> => {
  return await ApiService.post('/officers/update', officerProfile)
}

export const OfficerService = {
  getOfficer,
  updateOfficer,
}
