import { ApiService } from './ApiService'

const getAuthEndpoint = async (): Promise<{ authUrl: string }> => {
  return await ApiService.get<{ authUrl: string }>('/auth/login').then(
    (res) => res.data,
  )
}

const verifyLogin = async ({ code }: { code: string }): Promise<void> => {
  console.log('Verifying login')
  await ApiService.post('/auth/login', {
    code,
    // TODO: Remove this hardcoded empty state
    state: '',
  })
}

const whoAmI = async (): Promise<{ nric: string }> => {
  return await ApiService.get<{ nric: string }>('/auth/whoami').then(
    (res) => res.data,
  )
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
