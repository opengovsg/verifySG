import { Call } from 'database/entities'
import { GetOfficerProfileDto } from 'officers/dto/get-officer.dto'

export type GetCallDto = Pick<Call, 'id' | 'createdAt' | 'callScope'> & {
  officer: GetOfficerProfileDto
}
