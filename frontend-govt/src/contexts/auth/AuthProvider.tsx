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
    try {
      const retrievedOfficer = await AuthService.whoAmI()
      setIsAuthenticated(!!retrievedOfficer)
      if (retrievedOfficer) setOfficer(retrievedOfficer.email)
    } catch (e) {
      console.error(e)
      throw e
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
