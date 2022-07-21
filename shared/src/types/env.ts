// possible TODO: consider refactoring to enums:
// 'development' | 'staging' | 'production' | 'test'

export type EnvDto = {
  dsn: string
  env: string
}
