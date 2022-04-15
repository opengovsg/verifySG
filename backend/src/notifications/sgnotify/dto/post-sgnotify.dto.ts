import { IsString } from 'class-validator'

export class PostSGNotifyAuthzDto {
  @IsString()
  token: string
}

export class PostSGNotifyJweDto {
  @IsString()
  jwe: string
}
