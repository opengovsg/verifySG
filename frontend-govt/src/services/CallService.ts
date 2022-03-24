import { CallDto, CreateCallDto } from '../types'

import { ApiService } from './ApiService'

const createCall = async (callDetails: CreateCallDto): Promise<CallDto> => {
  return ApiService.post('/calls', callDetails).then((res) => res.data)
}

export const CallService = {
  createCall,
}
