import { IsString } from 'class-validator'

// TODO: refactor Officer DTOs into shared types (2/3)
export class UpdateOfficerProfileDto {
  @IsString()
  name: string

  @IsString()
  position: string
}
