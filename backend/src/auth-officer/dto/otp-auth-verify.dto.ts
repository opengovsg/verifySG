import { IsDefined, IsString } from 'class-validator'

export class OtpAuthVerifyDto {
  @IsDefined()
  @IsString()
  token: string

  @IsDefined()
  @IsString()
  email: string
}
