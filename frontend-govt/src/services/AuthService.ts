import { ApiService } from '@/services/ApiService'
import {
  OfficerWhoamiDto,
  OtpRequestDto,
  OtpVerifyDto,
} from '~shared/types/api'

const getOtp = async (otpRequest: OtpRequestDto): Promise<void> => {
  await ApiService.post('/auth-officers', otpRequest)
}

const verifyOtp = async (otpVerify: OtpVerifyDto): Promise<void> => {
  await ApiService.post('/auth-officers/verify', otpVerify)
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
