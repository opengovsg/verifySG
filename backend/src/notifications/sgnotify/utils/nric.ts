import nric from 'nric'

export const maskNric = (inputNric: string): string => {
  if (!nric.validate(inputNric)) {
    throw new Error('Invalid NRIC')
  }
  return `${inputNric.charAt(0)}••••${inputNric.slice(5)}`
}
