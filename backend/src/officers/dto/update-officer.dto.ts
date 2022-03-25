import { IsString } from 'class-validator'
export class UpdateOfficerProfileDto {
  @IsString()
  name!: string

  @IsString()
  position!: string
}
