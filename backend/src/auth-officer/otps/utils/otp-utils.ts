import crypto from 'crypto'
import { customAlphabet } from 'nanoid'

export const otpConfig = {
  customAlphabet: '0123456789',
  length: 6,
}

const otpGenerator = customAlphabet(otpConfig.customAlphabet, otpConfig.length)

const generateRandomSixDigitNumber = (): string => otpGenerator()

const generateHash = async (otp: string): Promise<string> => {
  return await crypto.createHash('md5').update(otp).digest('hex')
}

const generateOtpAndHashAsync = async (): Promise<{
  otp: string
  hash: string
}> => {
  const otp = generateRandomSixDigitNumber()
  return { otp, hash: await generateHash(otp) }
}

const verifyOtpWithHashAsync = async (
  otp: string,
  hash: string,
): Promise<boolean> => {
  return (await generateHash(otp)) === hash
}

export const otpUtils = {
  generateRandomSixDigitNumber,
  generateOtpAndHashAsync,
  verifyOtpWithHashAsync,
}
