import { ApiService } from '@/services/ApiService'
import { OfficerWhoamiDto } from '~shared/types/api'

const getOtp = async ({ email }: { email: string }): Promise<void> => {
  await ApiService.post('/auth-officers', {
    email,
  })
}

const verifyOtp = async ({
  email,
  otp,
}: {
  email: string
  otp: string
}): Promise<void> => {
  await ApiService.post('/auth-officers/verify', {
    email,
    otp,
  })
}

const whoAmI = async (): Promise<OfficerWhoamiDto> => {
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
