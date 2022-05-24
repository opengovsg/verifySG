import { IsDefined, IsString } from 'class-validator'

import { IsGovtEmail } from '../../common/decorators'

export class OtpAuthVerifyDto {
  @IsDefined()
  @IsString()
  token: string

  @IsDefined()
  @IsString()
  @IsGovtEmail()
  email: string
}
