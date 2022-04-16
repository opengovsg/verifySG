import { OfficerDto } from './officer'

export type NotificationDto = {
  id: number
  createdAt: Date
  officer: OfficerDto
}

export type sendNotificationDto = {
  nric: string
  callScope?: string
}
