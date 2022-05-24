import { IsDefined, IsString } from 'class-validator'

export class OtpAuthVerifyDto {
  @IsDefined()
  @IsString()
  otp: string

  @IsDefined()
  @IsString()
  email: string
}
