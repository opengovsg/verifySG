/**
 * Regex for govt email address that ends in .gov.sg
 * Cannot remember where I got the regex from; feel free to refactor if you find problems with this.
 * Likely not a problem, since we only accept whitelisted domains.
 */
const govtEmailRegex =
  "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+.gov.sg"
/**
 * Normalizes email by (1) converting to lowercase; (2) removing surrounding whitespace; (3) checking it is a .gov.sg email
 * validator.normalizeEmail() has more sophisticated logic for dealing with Gmail, Outlook etc., but not needed for us
 * @param email input email
 * @returns normalized email
 * @example given 'Benjamin_tan@spf.gov.sg' returns 'benjamin_tan@spf.gov.sg'
 */
export function normalizeEmail(email: string): string {
  const normalizedEmail = email.toLowerCase().trim()
  if (!normalizedEmail.match(govtEmailRegex))
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

export const isGovtEmail = (inputEmail: string): boolean => {
  return !!inputEmail.match(govtEmailRegex)
}

export const INVALID_GOV_SG_EMAIL =
  'Please provide a valid .gov.sg email address.'
