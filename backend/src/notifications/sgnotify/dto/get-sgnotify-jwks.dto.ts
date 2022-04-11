export interface GetSGNotifyJwksDto {
  keys: Array<{
    e: string
    kid: string
    n: string
  }>
}
