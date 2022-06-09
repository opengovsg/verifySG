import { IsAscii, IsString } from 'class-validator'

// TODO: refactor Officer DTOs into shared types (2/3)
export class UpdateOfficerProfileDto {
  @IsString()
  @IsAscii()
  name: string

  @IsString()
  @IsAscii()
  position: string
}
