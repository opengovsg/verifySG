import { IsString, IsOptional } from 'class-validator'

export class CreateCallDto {
  @IsString()
  @IsOptional()
  callScope!: string
}
