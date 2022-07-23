import { IsString, IsOptional, IsNotEmpty } from 'class-validator'
import { IsNric } from '~shared/decorators/nric-validator.decorator'
import { Notification } from 'database/entities'
import { OfficerDto } from '~shared/types/api'

// TODO refactor notification DTOs into shared folder 2/2
export class SendNotificationDto {
  @IsString()
  @IsOptional()
  callScope: string

  @IsString()
  @IsNric()
  @IsNotEmpty()
  nric: string
}

export type SendNotificationResponseDto = Pick<
  Notification,
  'id' | 'createdAt' | 'callScope'
> & {
  officer: OfficerDto
}
