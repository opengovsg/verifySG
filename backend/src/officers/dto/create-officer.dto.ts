import { IsEmail, IsString } from 'class-validator'

export class CreateOfficerDto {
  @IsEmail()
  email!: string

  @IsString()
  name!: string

  @IsString()
  position!: string

  @IsString()
  agency!: string
}
