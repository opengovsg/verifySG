import { IsArray } from 'class-validator'
import { JWK } from 'jose'

export interface SGNotifyJWK extends JWK {
  kty: string
  use: string
  crv: string
  kid: string
  x: string
  y: string
}

export class GetSGNotifyJwksDto {
  @IsArray()
  keys: Array<SGNotifyJWK>
}
