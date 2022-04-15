import { GetAgencyDto } from 'agencies/dto/get-agency.dto'
import { IsEmail, IsNotEmptyObject, IsNumber, IsString } from 'class-validator'

export class OfficerDto {
  @IsEmail()
  @IsString()
  email: string
}

export class GetOfficerDto {
  @IsNumber()
  id: number

  @IsString()
  name: string

  @IsString()
  position: string
}

export class GetOfficerProfileDto extends GetOfficerDto {
  @IsNotEmptyObject()
  agency: GetAgencyDto
}
