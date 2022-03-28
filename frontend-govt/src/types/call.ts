import { OfficerDto } from './officer'

export type CallDto = {
  id: number
  createdAt: Date
  officer: OfficerDto
}

export type CreateCallDto = {
  callScope?: string
}
