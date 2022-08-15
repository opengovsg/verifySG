import { createContext, useContext } from 'react'

interface AuthContext {
  isAuthenticated: boolean | undefined
  officerEmail: string
  officerAgency: string
  initOfficerInfo: () => Promise<void>
  logout: () => Promise<void>
}

// specify defaults for auth context
export const AuthContext = createContext<AuthContext | undefined>(undefined)

// convenience auth hook
export const useAuth = (): AuthContext => {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used within an AuthProvider')
  return auth
}

export default AuthContext
