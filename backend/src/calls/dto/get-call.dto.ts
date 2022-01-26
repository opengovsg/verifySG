import { Officer, Call } from 'database/entities'

export type GetCallOfficerDto = Pick<
  Officer,
  'id' | 'name' | 'email' | 'agency' | 'position'
>

export type GetCallDto = Pick<Call, 'id' | 'createdAt'> & {
  officer: GetCallOfficerDto
}
