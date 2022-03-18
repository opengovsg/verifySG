import { CallDto } from '../types'

import { ApiService } from './ApiService'

const createCall = async (nric: string): Promise<CallDto> => {
  return await ApiService.post('/calls', {
    nric,
  })
}

export const CallService = {
  createCall,
}
