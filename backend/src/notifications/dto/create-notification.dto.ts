import { IsString, IsOptional, IsNotEmpty } from 'class-validator'
import { IsNric } from '../../common/decorators'

export class CreateNotificationDto {
  @IsString()
  @IsOptional()
  callScope: string

  @IsString()
  @IsNric()
  @IsNotEmpty()
  nric: string
}
