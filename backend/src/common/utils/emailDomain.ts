/**
 *
 * @param email email address string
 * @returns domain of email address string
 * @example Given 'abc@open.gov.sg' returns 'open.gov.sg'
 */
import validator from 'validator'

export function normalizeEmail(email: string): string {
  // validator.normalizeEmail() has more sophisticated logic for dealing with email addresses, but not needed for us
  if (!validator.isEmail(email)) throw new Error(`Invalid email '${email}'`)
  return email.toLowerCase()
}

export function parseEmailDomain(email: string): string | Error {
  email = normalizeEmail(email)
  return email.split('@')[1]
}
