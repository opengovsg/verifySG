import { AgencyDto } from '~shared/types/api'

// TODO: refactor Officer DTOs into shared types (1/3)
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
