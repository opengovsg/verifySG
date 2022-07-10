import { ReactChild, ReactChildren, useEffect, useState } from 'react'

import { AuthService } from '../../services/AuthService'

import { AuthContext } from './AuthContext'

// auth provider props & declaration
interface AuthProps {
  children: ReactChild | ReactChildren
}

// returns a
export const AuthProvider = ({ children }: AuthProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(
    false,
  )
  const [officer, setOfficer] = useState<string>('')

  const getOfficer = async (): Promise<void> => {
    const retrievedOfficer = await AuthService.whoAmI()
    if ('email' in retrievedOfficer) {
      setOfficer(retrievedOfficer.email)
      setIsAuthenticated(true)
    }
  }

  useEffect(() => {
    getOfficer()
  }, [getOfficer])

  const logout = async (): Promise<void> => {
    await AuthService.logout()
    setIsAuthenticated(false)
    setOfficer('')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        officer,
        getOfficer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
