import { OfficerDto } from './officer'

// TODO refactor notification DTOs into shared folder 1/2
export type SendNotificationResponseDto = {
  id: number
  createdAt: Date
  officer: OfficerDto
}

export type SendNotificationDto = {
  nric: string
  callScope?: string
}
