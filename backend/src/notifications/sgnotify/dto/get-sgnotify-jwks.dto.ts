export interface GetSGNotifyJwksDto {
  keys: Array<{
    kty: string
    use: string
    crv: string
    kid: string
    x: string
    y: string
  }>
}
