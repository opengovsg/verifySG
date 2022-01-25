import { ApiService } from './ApiService'

const getAuthEndpoint = async (): Promise<{ authUrl: string }> => {
  return await ApiService.get<{ authUrl: string }>('/auth/login').then(
    (res) => res.data,
  )
}

const verifyLogin = async ({
  code,
  state,
}: {
  code: string
  state: string
}): Promise<void> => {
  await ApiService.post('/auth/login', {
    code,
    state,
  })
}

const whoAmI = async (): Promise<void> => {
  console.log('who am i')
  await ApiService.get<{ nric: string }>('/auth/whoami')
}

const logout = async (): Promise<void> => {
  await ApiService.post('/auth/logout')
}

export const AuthService = {
  getAuthEndpoint,
  verifyLogin,
  whoAmI,
  logout,
}
