import { createContext, useContext } from 'react'

// state / context typings
export interface AuthState {
  isAuthenticated: boolean
  email: string
  name: string
  _id: number
}

interface AuthContext {
  authState: AuthState
  setAuthState: (authState: AuthState) => void
}

// specify defaults for auth context
export const AuthContext = createContext<AuthContext>({
  authState: {
    isAuthenticated: false,
    email: '',
    name: '',
    _id: 1,
  },
  setAuthState: () => null,
})

// convenience auth hook
export const useAuth = () => useContext(AuthContext)

export default AuthContext
