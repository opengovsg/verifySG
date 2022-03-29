import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUppercase,
  Matches,
  IsOptional,
  IsUrl,
  ArrayMinSize,
} from 'class-validator'
export class CreateAgencyDto {
  @IsNotEmpty()
  @IsUppercase()
  // Only allow alphanumeric and dash
  @Matches(/^[A-Za-z0-9-]*$/)
  id: string

  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsUrl()
  logoUrl: string

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @Matches(/^[a-zA-Z0-9.-]+$/, { each: true }) // simple regex check for email domain string
  emailDomains: string[]
}
