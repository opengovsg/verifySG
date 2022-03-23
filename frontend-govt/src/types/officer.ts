import { AgencyDto } from './agency'

export type OfficerDto = {
  id: number
  name?: string
  agency: AgencyDto
  position?: string
}

export type UpdateOfficerDto = {
  name?: string
  position?: string
}
