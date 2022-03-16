import { ReactChild, ReactChildren, useState } from 'react'
import { AuthContext, AuthState } from './AuthContext'

// auth provider props & declaration
interface AuthProps {
  children: ReactChild | ReactChildren
}

// returns a
export const AuthProvider = ({ children }: AuthProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    email: '',
    name: '',
    _id: 1,
  })
  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
