import { UpdateOfficerReqDto } from '../officer.dto'

import { validateDto } from './helper'

describe('UpdateOfficerReqDto', () => {
  test('UpdateOfficerReqDto is valid', async () => {
    const errors = await validateDto(UpdateOfficerReqDto, {
      name: 'John Doe',
      position: 'Position',
    })
    expect(errors).toHaveLength(0)
  })
  it('should throw an error if name and position are not provided', async () => {
    const errors = await validateDto(UpdateOfficerReqDto, {})
    expect(errors).toHaveLength(2)
    expect(JSON.stringify(errors)).toContain('name must be a string')
    expect(JSON.stringify(errors)).toContain('position must be a string')
  })

  it('should throw an error if name and position are empty strings', async () => {
    const errors = await validateDto(UpdateOfficerReqDto, {
      name: '',
      position: '',
    })
    expect(errors.length).toBe(2)
    expect(JSON.stringify(errors)).toContain('name should not be empty')
    expect(JSON.stringify(errors)).toContain('position should not be empty')
  })

  it('should throw an error if name and position are not ASCII characters', async () => {
    const errors = await validateDto(UpdateOfficerReqDto, {
      name: '👨‍💻',
      position: '💩',
    })
    expect(errors.length).toBe(2)
    expect(JSON.stringify(errors)).toContain(
      'name must contain only ASCII characters',
    )
    expect(JSON.stringify(errors)).toContain(
      'position must contain only ASCII characters',
    )
  })
})
