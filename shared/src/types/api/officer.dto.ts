import {
  IsAscii,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'

import { AgencyDto } from './agency.dto'

export type OfficerWhoamiResDto = OfficerWhoamiSuccess | OfficerWhoamiFailure

export class OfficerWhoamiSuccess {
  // TODO (maybe): refactor into common email property
  @IsEmail() // in theory can make is specific to gov.sg email
  email: string
}

export class OfficerWhoamiFailure {
  message: string
}

export class OfficerBase {
  @IsString()
  @IsAscii()
  @IsNotEmpty()
  name: Exclude<string, ''>

  @IsString()
  @IsAscii()
  @IsNotEmpty()
  position: Exclude<string, ''>
}

export class OfficerDto extends OfficerBase {
  @IsNumber()
  id: number

  agency: AgencyDto
}

export type OfficerResDto = OfficerDto

export class UpdateOfficerReqDto extends OfficerBase {}
