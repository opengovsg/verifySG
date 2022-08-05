import { IsAscii, IsEmail, IsNumber, IsString } from 'class-validator'

import { AgencyDto } from './agency.dto'

export type OfficerWhoamiResDto = OfficerWhoamiSuccess | OfficerWhoamiFailure

export class OfficerWhoamiSuccess {
  // TODO (maybe): refactor into common email property
  @IsEmail() // in theory can make is specific to gov.sg email
  email: string

  @IsString()
  agencyShortName: string
}

export class OfficerWhoamiFailure {
  message: string
}

export class OfficerBase {
  @IsString()
  @IsAscii()
  name: string

  @IsString()
  @IsAscii()
  position: string
}

export class OfficerDto extends OfficerBase {
  @IsNumber()
  id: number

  agency: AgencyDto
}

export type OfficerResDto = OfficerDto

export type UpdateOfficerResDto = OfficerBase
