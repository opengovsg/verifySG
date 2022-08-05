import { ReactChild, ReactChildren, useEffect, useState } from 'react'
import { AuthService } from '@services/AuthService'

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
  const [agencyShortName, setAgencyShortName] = useState<string>('')

  const getOfficer = async (): Promise<void> => {
    const retrievedOfficer = await AuthService.whoAmI()
    if (retrievedOfficer) {
      if ('email' in retrievedOfficer) setOfficer(retrievedOfficer.email)
      if ('agencyShortName' in retrievedOfficer)
        setAgencyShortName(retrievedOfficer.agencyShortName)
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
        agencyShortName,
        getOfficer,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
