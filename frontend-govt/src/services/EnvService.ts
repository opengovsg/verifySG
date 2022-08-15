import { ApiService } from './ApiService'

import { EnvResDto } from '~shared/types/api'

const getEnv = async (): Promise<EnvResDto> => {
  return ApiService.get('/env').then((res) => {
    return res.data
  })
}

export const EnvService = {
  getEnv,
}
