import { IsString, IsNotEmpty } from 'class-validator'

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  mopNric!: string
}
