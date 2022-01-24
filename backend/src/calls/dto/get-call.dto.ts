import { Officer, Call } from 'database/entities'

export type GetCallOfficerDto = Pick<
  Officer,
  'id' | 'name' | 'email' | 'agency'
>

export type GetCallDto = Pick<Call, 'id'> & {
  officer: GetCallOfficerDto
}
