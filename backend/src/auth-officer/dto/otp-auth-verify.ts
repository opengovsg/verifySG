import { IsDefined, IsString } from 'class-validator'

export class OtpAuthVerify {
  @IsDefined()
  @IsString()
  token: string

  @IsDefined()
  @IsString()
  email: string
}
