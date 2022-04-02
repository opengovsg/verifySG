import { JWTPayload } from 'jose'

export interface AuthPayload {
  access_token: string
  aud: string
  exp: number
  token_type: string
  scope: string
}

export interface NotificationPayload {
  aud: string
  exp: number
  request_id: string
}

export type SGNotifyPayload = JWTPayload | AuthPayload | NotificationPayload
