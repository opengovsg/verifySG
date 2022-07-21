import { Notification } from 'database/entities'
import { GetOfficerProfileDto } from '../../officers/dto'

// TODO refactor notification DTOs into shared folder 2/2
export type SendNotificationResponseDto = Pick<
  Notification,
  'id' | 'createdAt' | 'callScope'
> & {
  officer: GetOfficerProfileDto
}
