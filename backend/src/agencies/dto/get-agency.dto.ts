import {
  IsNotEmpty,
  IsString,
  IsUppercase,
  IsUrl,
  Matches,
} from 'class-validator'

export class GetAgencyDto {
  @IsNotEmpty()
  @IsUppercase()
  // Only allow alphanumeric and dash
  @Matches(/^[A-Za-z0-9-]*$/)
  id: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsUrl()
  logoUrl: string
}
