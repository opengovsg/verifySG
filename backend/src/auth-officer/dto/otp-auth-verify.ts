import { IsString } from 'class-validator'

export class OtpAuthVerify {
  @IsString()
  token!: string

  @IsString()
  email!: string
}
