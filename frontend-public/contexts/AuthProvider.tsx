import React, {
  createContext,
  ReactChild,
  ReactChildren,
  useState,
} from 'react'

interface AuthProps {
  children: ReactChild | ReactChildren
}

interface AuthState {
  isAuthenticated: boolean
  nric: string
}

interface AuthContext {
  authState: AuthState
  setAuthState: (authState: AuthState) => void
}

export const AuthContext = createContext<AuthContext>({
  authState: {
    isAuthenticated: false,
    nric: '',
  },
  setAuthState: (authState) => {},
})

const AuthProvider = ({ children }: AuthProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    nric: '',
  })
  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
