import { ApiService } from './ApiService'

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

// TODO: use shared types to align service types with backend API types example (1/2)
export interface OfficerWhoamiSuccessDto {
  email: string
}

export interface OfficerWhoamiFailureDto {
  message: string
}

export type OfficerWhoamiDto = OfficerWhoamiSuccessDto | OfficerWhoamiFailureDto

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
