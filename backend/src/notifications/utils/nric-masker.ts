import nric from 'nric'

export const nricMasker = (inputNric: string): string => {
  if (!nric.validate(inputNric)) {
    throw new Error('Invalid NRIC')
  }
  return `XXXXX${inputNric.slice(5)}`
}
