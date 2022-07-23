import { IsEmail } from 'class-validator'

export type OfficerWhoamiDto = OfficerWhoamiSuccess | OfficerWhoamiFailure

export class OfficerWhoamiSuccess {
  @IsEmail() // in theory can make is specific to gov.sg email
  email: string
}

export class OfficerWhoamiFailure {
  message: string
}
