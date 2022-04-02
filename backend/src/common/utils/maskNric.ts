import nric from 'nric'

export const maskNric = (inputNric: string): string => {
  if (!nric.validate(inputNric)) {
    throw new Error('Invalid NRIC')
  }
  return `XXXXX${inputNric.slice(5)}`
}
