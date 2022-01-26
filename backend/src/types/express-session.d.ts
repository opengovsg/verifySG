import 'express-session'

declare module 'express-session' {
  interface SessionData {
    mopId: number
    officerId: number
  }
}
