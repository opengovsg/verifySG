import bcrypt from 'bcrypt'
import { customAlphabet } from 'nanoid'

export const otpConfig = {
  customAlphabet: '0123456789',
  length: 6,
}

const otpGenerator = customAlphabet(otpConfig.customAlphabet, otpConfig.length)

const generateRandomSixDigitNumber = (): string => otpGenerator()

const generateOtpAndHashAsync = async (
  saltRounds: number,
): Promise<{ otp: string; hash: string }> => {
  const otp = generateRandomSixDigitNumber()
  const hash = await bcrypt.hash(otp, saltRounds)
  return { otp, hash }
}

const verifyOtpWithHashAsync = async (
  otp: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(otp, hash)
}

export const otpUtils = {
  generateRandomSixDigitNumber,
  generateOtpAndHashAsync,
  verifyOtpWithHashAsync,
}
