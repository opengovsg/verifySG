import { Officer } from 'database/entities'
import { GetAgencyDto } from 'agencies/dto/get-agency.dto'

export type OfficerDto = Pick<Officer, 'email'>

export type GetOfficerDto = Pick<Officer, 'id' | 'name' | 'position'>

export type GetOfficerProfileDto = GetOfficerDto & { agency: GetAgencyDto }
