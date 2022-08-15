export type EnvResDto = {
  dsn: string
  env: 'development' | 'staging' | 'production' | 'test'
  isDowntime: boolean
}
