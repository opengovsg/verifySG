import { normalizeEmail, parseEmailDomain, SG_GOVT_EMAIL_REGEX } from '../email'

describe('test SG_GOVT_EMAIL_REGEX validity', () => {
  it('match valid government email addresses', () => {
    const validSgGovtEmails = [
      'benjamin_tan@spf.gov.sg',
      'ben_tan@moh.gov.sg',
      'ben@pa.gov.sg',
      'ben.tan@open.gov.sg',
      'ben@open.gov.sg',
    ]
    for (const email of validSgGovtEmails) {
      expect(email.match(SG_GOVT_EMAIL_REGEX)).toBeTruthy()
    }
  })

  it('fails to match invalid email addresses', () => {
    const invalidEmails = [
      'ben@gmail.com',
      'ben@hotmail.com',
      'ben@gov.sg',
      'ben@gov.sg.com',
    ]
    for (const email of invalidEmails) {
      expect(email.match(SG_GOVT_EMAIL_REGEX)).toBeFalsy()
    }
  })
})

describe('normalizeEmail tests', () => {
  it('normalize valid government email addresses', () => {
    const validSgGovtEmails = [
      'benjAMIN_TaN@spF.GoV.sG',
      'bEn_Tan@MoH.GOV.Sg',
      'BEN@pa.gov.sg',
      'ben.tan@OPEN.gov.sg',
      '   ben@open.gov.sg  ',
    ]
    const expectedNormalizedSgGovtEmails = [
      'benjamin_tan@spf.gov.sg',
      'ben_tan@moh.gov.sg',
      'ben@pa.gov.sg',
      'ben.tan@open.gov.sg',
      'ben@open.gov.sg',
    ]
    validSgGovtEmails.map((email, index) => {
      expect(normalizeEmail(email)).toEqual(
        expectedNormalizedSgGovtEmails[index],
      )
    })
  })
  it('invalid email will throw error', () => {
    const invalidEmails = [
      'ben@gmail.com',
      'ben@hotmail.com',
      'ben@gov.sg',
      'ben@gov.sg.com',
      'ben@gov.sg.nesteddomain.com',
    ]
    invalidEmails.map((email) => {
      expect(() => normalizeEmail(email)).toThrowError(
        `Invalid email '${email}'`,
      )
    })
  })
})

describe('parseEmailDomain tests', () => {
  const validSgGovtEmails = [
    'benjamin_tan@spf.gov.sg',
    'ben_tan@moh.gov.sg',
    'ben@pa.gov.sg',
    'ben.tan@open.gov.sg',
    'ben@open.gov.sg',
  ]
  const expectedDomains = [
    'spf.gov.sg',
    'moh.gov.sg',
    'pa.gov.sg',
    'open.gov.sg',
    'open.gov.sg',
  ]
  validSgGovtEmails.map((email, index) => {
    expect(parseEmailDomain(email)).toEqual(expectedDomains[index])
  })
})
