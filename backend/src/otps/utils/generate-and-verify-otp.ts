import bcrypt from 'bcrypt'
import crypto from 'crypto'

export const generateRandomSixDigitNumber = (): string => {
  return Array(6)
    .fill(0)
    .map(() => crypto.randomInt(0, 10))
    .join('')
}

export const generateOtpWitHash = (
  saltRounds: number,
): { otp: string; hash: string } => {
  const otp = generateRandomSixDigitNumber()
  const hash = bcrypt.hashSync(otp, saltRounds)
  return { otp, hash }
}

export const verifyOtpWithHash = (otp: string, hash: string): boolean => {
  return bcrypt.compareSync(otp, hash)
}

export const convertMillisecondsToMinutes = (milliseconds: number): number => {
  return Math.floor(milliseconds / (1000 * 60))
}
