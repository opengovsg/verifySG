const SIMPLE_EMAIL_REGEX = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/

/**
 *
 * @param email email address string
 * @returns domain of email address string
 * @example Given 'abc@open.gov.sg' returns 'open.gov.sg'
 */

export function parseEmailDomain(email: string): string | Error {
  if (!email.match(SIMPLE_EMAIL_REGEX)) {
    throw new Error(`Not an email string`)
  }
  return email.split('@')[1].toLowerCase()
}
