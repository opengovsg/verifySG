import { JWTPayload } from 'jose'
import { IsNumber, IsString } from 'class-validator'

export class AuthResPayload {
  @IsString()
  access_token: string

  @IsString()
  aud: string

  @IsNumber()
  exp: number

  @IsString()
  token_type: string

  @IsString()
  scope: string
}

export class NotificationResPayload {
  @IsString()
  aud: string

  @IsNumber()
  exp: number

  @IsString()
  request_id: string
}

export type SGNotifyResPayload =
  | JWTPayload
  | AuthResPayload
  | NotificationResPayload
