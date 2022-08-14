import { ApiService } from '@services/ApiService'

import { OfficerResDto, UpdateOfficerReqDto } from '~shared/types/api'

const getOfficer = async (): Promise<OfficerResDto> => {
  return ApiService.get('/officers').then((res) => res.data)
}

const updateOfficer = async (
  officerProfile: UpdateOfficerReqDto,
): Promise<void> => {
  return await ApiService.post('/officers/update', officerProfile)
}

export const OfficerService = {
  getOfficer,
  updateOfficer,
}
