import { Officer } from 'database/entities'

export type OfficerDto = Pick<Officer, 'email'> // TODO OTP DTO refactor
