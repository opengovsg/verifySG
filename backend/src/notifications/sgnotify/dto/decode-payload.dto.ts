import { IsNumber, IsString } from 'class-validator'
import { JWTPayload } from 'jose'

export class AuthResPayload implements JWTPayload {
  @IsString()
  access_token: string

  @IsString()
  aud: string

  @IsNumber()
  exp: number

  @IsString()
  token_type: string

  @IsString()
  scope: string;

  [propName: string]: unknown
}

export class NotificationResPayload implements JWTPayload {
  @IsString()
  aud: string

  @IsNumber()
  exp: number

  @IsString()
  request_id: string;

  [propName: string]: unknown
}

export type SGNotifyResPayload = AuthResPayload | NotificationResPayload
