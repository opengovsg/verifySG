import { Officer } from 'database/entities'

export type OfficerDto = Pick<Officer, 'email'>

export type UpdateOfficerDto = Pick<Officer, 'name' | 'agency' | 'position'>
