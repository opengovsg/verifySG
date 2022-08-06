import { maskNric, normalizeNric } from '../nric'

describe('normalizeNric tests', () => {
  it('normalize valid NRIC', () => {
    const validNrics = [
      's1234567D',
      's2168160A',
      's5166634H',
      't2987410c',
      't9961796e',
      'f2870961r',
      'f0640446n',
      'f9474644l',
      'G4210145t',
      'G4256977t',
      'M9975399k',
      'M2392358t',
    ]
    const expectedNormalizedNrics = [
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
    expect(validNrics.map(normalizeNric)).toStrictEqual(expectedNormalizedNrics)
  })
  it('throw error on invalid NRIC', () => {
    const invalidNrics = [
      'S1234567A',
      'S1234567',
      's1234367',
      's2168160B',
      's5166634I',
      't2987410A',
      't9961796F',
      'f2870961J',
      'f0640446R',
      'f9474644p',
      'G4210145h',
      'G4256977n',
      'M9975399m',
      'M2392358a',
    ]
    invalidNrics.map((nric) => {
      expect(() => normalizeNric(nric)).toThrowError(`Invalid NRIC ${nric}`)
    })
  })
})

describe('maskNric tests', () => {
  const validNrics = [
    's1234567D',
    's2168160A',
    's5166634H',
    't2987410c',
    't9961796e',
    'f2870961r',
    'f0640446n',
    'f9474644l',
    'G4210145t',
    'G4256977t',
    'M9975399k',
    'M2392358t',
  ]
  const expectedMaskedNrics = [
    'S••••567D',
    'S••••160A',
    'S••••634H',
    'T••••410C',
    'T••••796E',
    'F••••961R',
    'F••••446N',
    'F••••644L',
    'G••••145T',
    'G••••977T',
    'M••••399K',
    'M••••358T',
  ]
  expect(validNrics.map(maskNric)).toStrictEqual(expectedMaskedNrics)
})
