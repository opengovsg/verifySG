import { IsString } from 'class-validator'

export class SgidAuthCode {
  @IsString()
  code!: string

  @IsString()
  state!: string
}
