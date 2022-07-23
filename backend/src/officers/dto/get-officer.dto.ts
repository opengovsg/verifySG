import { Officer } from 'database/entities'
import { AgencyDto } from '~shared/types/api'

// TODO: refactor Officer DTOs into shared types (3/3)
export type OfficerDto = Pick<Officer, 'email'>

export type GetOfficerDto = Pick<Officer, 'id' | 'name' | 'position'>

export type GetOfficerProfileDto = GetOfficerDto & { agency: AgencyDto }
