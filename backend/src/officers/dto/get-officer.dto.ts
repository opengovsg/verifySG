import { Officer } from 'database/entities'
import { GetAgencyDto } from 'agencies/dto/get-agency.dto'

export type OfficerDto = Pick<Officer, 'email'>

export type GetOfficerDto = Pick<Officer, 'id' | 'name' | 'position'>

// TODO: use shared types to align service types with backend API types example (2/2)
export type OfficerWhoamiDto = OfficerWhoamiSuccessDto | OfficerWhoamiFailureDto

export type OfficerWhoamiSuccessDto = OfficerDto

export interface OfficerWhoamiFailureDto {
  message: string
}

export type GetOfficerProfileDto = GetOfficerDto & { agency: GetAgencyDto }
