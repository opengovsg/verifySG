import { IsString, IsNotEmpty, IsNumber } from 'class-validator'

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  mopNric!: string

  @IsNumber()
  @IsNotEmpty()
  officerId!: number
}
