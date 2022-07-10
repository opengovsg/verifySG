/**
 * Normalizes email by (1) converting to lowercase; (2) removing surrounding whitespace; (3) checking it is a .gov.sg email
 * validator.normalizeEmail() has more sophisticated logic for dealing with Gmail, Outlook etc., but not needed for us
 * @param email input email
 * @returns normalized email
 * @example given 'Benjamin_tan@spf.gov.sg' returns 'benjamin_tan@spf.gov.sg'
 */
export function normalizeEmail(email: string): string {
  const normalizedEmail = email.toLowerCase().trim()
  // TODO: refactor regexp into shared directory (2/2)
  if (
    !normalizedEmail.match(
      "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+.gov.sg",
    )
  )
    throw new Error(`Invalid email '${email}'`)
  return normalizedEmail
}

/**
 * @param email email address string
 * @returns domain of email address string
 * @example given 'abc@open.gov.sg' returns 'open.gov.sg'
 */
export function parseEmailDomain(email: string): string {
  email = normalizeEmail(email)
  return email.split('@')[1]
}
