import nric from 'nric'

export const normalizeNric = (inputNric: string): string => {
  if (!nric.validate(inputNric)) {
    throw new Error(`Invalid NRIC ${inputNric}`)
  }
  return inputNric.toUpperCase()
}

export const maskNric = (inputNric: string): string => {
  const normalizedNric = normalizeNric(inputNric)
  return `${normalizedNric.charAt(0)}••••${normalizedNric.slice(5)}`
}
