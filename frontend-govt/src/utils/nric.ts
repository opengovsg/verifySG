import nric from 'nric'

// TODO: refactor into shared types 1/2
export const maskNric = (inputNric: string): string => {
  if (!nric.validate(inputNric)) {
    throw new Error('Invalid NRIC')
  }
  return `${inputNric.charAt(0)}••••${inputNric.slice(5)}`
}
