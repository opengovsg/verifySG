import { IsString, IsNotEmpty } from 'class-validator'
import { IsNric } from '../../common/decorators'
import { Notification, Purpose } from 'database/entities'
import { GetOfficerProfileDto } from '../../officers/dto'

// TODO refactor notification DTOs into shared folder 2/2
export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  purposeId: string

  @IsString()
  @IsNric()
  @IsNotEmpty()
  nric: string
}

export type SendNotificationResponseDto = Pick<
  Notification,
  'id' | 'createdAt'
> & {
  officer: GetOfficerProfileDto
} & {
  purpose: Pick<Purpose, 'purposeId' | 'menuDescription'>
}
