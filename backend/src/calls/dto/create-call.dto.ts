import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  nric!: string

  @IsString()
  @IsOptional()
  callScope!: string
}
