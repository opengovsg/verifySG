import { ApiService } from './ApiService'

const getOtp = async ({ email }: { email: string }): Promise<void> => {
  await ApiService.post('/auth-officers', {
    email,
  })
}

const verifyOtp = async ({
  email,
  token,
}: {
  email: string
  token: string
}): Promise<void> => {
  await ApiService.post('/auth-officers/verify', {
    email,
    token,
  })
}

const whoAmI = async (): Promise<{ email: string } | undefined> => {
  return await ApiService.get('/auth-officers/whoami').then((res) => res.data)
}

const logout = async (): Promise<void> => {
  await ApiService.post('/auth-officers/logout')
}

export const AuthService = {
  getOtp,
  verifyOtp,
  whoAmI,
  logout,
}
