import { validate } from 'class-validator'

import { IsNric } from '../nric-validator.decorator'

describe('IsNric', () => {
  class TestClass {
    @IsNric()
    nric: unknown
  }

  it('returns no errors for valid normalized NRIC', async () => {
    const testNrics = [
      'S1234567D',
      'S2168160A',
      'S5166634H',
      'T2987410C',
      'T9961796E',
      'F2870961R',
      'F0640446N',
      'F9474644L',
      'G4210145T',
      'G4256977T',
      'M9975399K',
      'M2392358T',
    ]
    const test = new TestClass()
    for (const nric of testNrics) {
      test.nric = nric
      const result = await validate(test)
      expect(result).toStrictEqual([])
    }
  })

  it('returns no errors even if nric is not normalized', async () => {
    const testNrics = ['s1234567d', 'S1234567d', 's3002862G']
    for (const nric of testNrics) {
      const test = new TestClass()
      test.nric = nric
      const result = await validate(test)
      expect(result).toStrictEqual([])
    }
  })
  it('returns error due to invalid checksum', async () => {
    const test = new TestClass()
    test.nric = 'S1234567A'
    const result = await validate(test)
    expect(result.length).toBe(1)
  })

  it('returns error on undefined', async () => {
    const test = new TestClass()
    test.nric = undefined
    const result = await validate(test)
    expect(result.length).toBe(1)
  })

  it('returns error if not string', async () => {
    const test = new TestClass()
    test.nric = 12345
    const result = await validate(test)
    expect(result.length).toBe(1)
  })
})
