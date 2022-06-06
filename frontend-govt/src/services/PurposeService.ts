import { AllPurposesDto } from '../types/purpose'

import { ApiService } from './ApiService'

const getAllPurposes = async (): Promise<AllPurposesDto> => {
  return ApiService.get('/purposes/all').then((res) => res.data)
}

export const PurposeService = {
  getAllPurposes,
}
