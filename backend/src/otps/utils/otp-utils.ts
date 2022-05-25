import bcrypt from 'bcrypt'
import crypto from 'crypto'

const generateRandomSixDigitNumber = (): string => {
  return Array(6)
    .fill(0)
    .map(() => crypto.randomInt(0, 10))
    .join('')
}

const generateOtpAndHash = async (
  saltRounds: number,
): Promise<{ otp: string; hash: string }> => {
  const otp = generateRandomSixDigitNumber()
  const hash = await bcrypt.hash(otp, saltRounds)
  return { otp, hash }
}

const verifyOtpWithHash = async (
  otp: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(otp, hash)
}

export const otpUtils = {
  generateRandomSixDigitNumber,
  generateOtpAndHash,
  verifyOtpWithHash,
}
