import { Notification } from 'database/entities'
import { GetOfficerProfileDto } from 'officers/dto/get-officer.dto'

export type GetNotificationDto = Pick<
  Notification,
  'id' | 'createdAt' | 'callScope'
> & {
  officer: GetOfficerProfileDto
}
