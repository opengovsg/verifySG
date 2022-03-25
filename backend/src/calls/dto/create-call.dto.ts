import { IsString, IsNotEmpty, IsOptional } from 'class-validator'
import { IsNric } from 'common/decorators'

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  @IsNric()
  nric!: string

  @IsString()
  @IsOptional()
  callScope!: string
}
