import { IsString, IsUrl } from 'class-validator'

export class AgencyDto {
  @IsString()
  id: string

  @IsString()
  name: string

  @IsUrl() // in theory, can specify it must be a file.go.gov.sg url
  logoUrl: string
}
