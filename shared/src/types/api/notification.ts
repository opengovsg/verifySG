import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

import { IsNric } from '../../decorators'

export class SendNotificationDto {
  @IsString()
  @IsOptional()
  callScope: string

  @IsString()
  @IsNric()
  @IsNotEmpty()
  nric: string
}
