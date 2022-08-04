import { ApiService } from '@/services/ApiService'
import {
  GetOtpReqDto,
  OfficerWhoamiResDto,
  VerifyOtpReqDto,
} from '~shared/types/api'

const getOtp = async (otpRequest: GetOtpReqDto): Promise<void> => {
  await ApiService.post('/auth-officers', otpRequest)
}

const verifyOtp = async (otpVerify: VerifyOtpReqDto): Promise<void> => {
  await ApiService.post('/auth-officers/verify', otpVerify)
}

const whoAmI = async (): Promise<OfficerWhoamiResDto> => {
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
