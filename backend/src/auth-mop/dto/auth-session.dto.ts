import { SessionData } from 'express-session'

export interface AuthSession extends SessionData {
  hello: string
}
