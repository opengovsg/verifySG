import { ApiService } from '@services/ApiService'

import { OfficerDto, UpdateOfficerDto } from '~shared/types/api'

const getOfficer = async (): Promise<OfficerDto> => {
  return ApiService.get('/officers').then((res) => res.data)
}

const updateOfficer = async (
  officerProfile: UpdateOfficerDto,
): Promise<void> => {
  return await ApiService.post('/officers/update', officerProfile)
}

export const OfficerService = {
  getOfficer,
  updateOfficer,
}
