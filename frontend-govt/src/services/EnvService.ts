import { ApiService } from './ApiService'

import { EnvDto } from '~shared/types/api'

const getEnv = async (): Promise<EnvDto> => {
  return ApiService.get('/env').then((res) => {
    return res.data
  })
}

export const EnvService = {
  getEnv,
}
