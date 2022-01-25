import { IsString, IsUrl } from 'class-validator'

export class SgidAuthUrl {
  @IsString()
  @IsUrl()
  authUrl!: string
}
