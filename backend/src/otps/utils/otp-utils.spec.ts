import { OTP } from '../../database/entities'

import { otpUtils } from './otp-utils'

export const mockEmailAddress = 'benjamin_tan@spf.gov.sg'

export const ONE_MINUTE_IN_MILLISECONDS = 60 * 1000

export const otpMock = '089282'

export const generateIncorrectOtp = (correctOtp: string): string => {
  return correctOtp === '999999'
    ? '000000'
    : convertNumberToSixDigitString(+correctOtp + 1)
}

const convertNumberToSixDigitString = (number: number): string => {
  return `${number}`.padStart(6, '0').slice(0, 6)
}

export const otpEntityMock: OTP = {
  createdAt: new Date(Date.now() - 5 * ONE_MINUTE_IN_MILLISECONDS),
  email: mockEmailAddress,
  expiredAt: new Date(Date.now() + 10 * ONE_MINUTE_IN_MILLISECONDS),
  hash: '$2b$10$SMxZF/FO1jftpFULJSJfyuIhnZ.0LVAvFbUQqMdYoiLrAKxNQgBFe',
  id: 1,
  numOfAttempts: 0,
  updatedAt: new Date(Date.now() - 5 * ONE_MINUTE_IN_MILLISECONDS),
}
describe('otpUtils', () => {
  it('should verify otp as matching hash', async () => {
    const verificationResultBool = await otpUtils.verifyOtpWithHashAsync(
      otpMock,
      otpEntityMock.hash,
    )
    expect(verificationResultBool).toBe(true)
  })

  it('generate incorrect otps', async () => {
    expect(generateIncorrectOtp('999999')).toBe('000000')
    expect(generateIncorrectOtp('000000')).toBe('000001')
    expect(generateIncorrectOtp('012345')).toBe('012346')
    expect(generateIncorrectOtp('123456')).toBe('123457')
  })

  it('otp and hash should not match', async () => {
    const verificationResultBool = await otpUtils.verifyOtpWithHashAsync(
      generateIncorrectOtp(otpMock),
      otpEntityMock.hash,
    )
    expect(verificationResultBool).toBe(false)
  })
})
