import {
  ReactChild,
  ReactChildren,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { AuthService } from '@services/AuthService'

import { AuthContext } from './AuthContext'

// auth provider props & declaration
interface AuthProps {
  children: ReactChild | ReactChildren
}

export const AuthProvider = ({ children }: AuthProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [officer, setOfficer] = useState('')
  const [agencyShortName, setAgencyShortName] = useState('')

  const initializeOfficerInfo = useCallback(async (): Promise<void> => {
    const officerWhoamiResDto = await AuthService.whoAmI()
    setIsAuthenticated(officerWhoamiResDto.authenticated)
    // return early if officer is not authenticated
    if (!officerWhoamiResDto.authenticated) return
    // TypeScript discriminated union can infer officerWhoamiResDto is OfficerWhoamiSuccess
    setOfficer(officerWhoamiResDto.email)
    setAgencyShortName(officerWhoamiResDto.agencyShortName)
  }, [])

  useEffect(() => {
    void initializeOfficerInfo()
  }, [initializeOfficerInfo])

  const logout = async (): Promise<void> => {
    await AuthService.logout()
    setIsAuthenticated(false)
    setOfficer('')
    setAgencyShortName('')
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        officer,
        agencyShortName,
        initializeOfficerInfo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
