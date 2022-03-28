import { CallDto } from './call'

export type NotificationDto = {
  id: number
  createdAt: Date
  call: CallDto
}

export type CreateNotificationDto = {
  callId: number
  nric: string
  // phoneNumber?: string
}
