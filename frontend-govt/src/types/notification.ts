import { OfficerDto } from './officer'
import { PurposeResponseDto } from './purpose'

// TODO refactor notification DTOs into shared folder 1/2
export type SendNotificationResponseDto = {
  id: number
  createdAt: Date
  officer: OfficerDto
  purpose: PurposeResponseDto
}

export type SendNotificationDto = {
  nric: string
  purposeId: string
}
