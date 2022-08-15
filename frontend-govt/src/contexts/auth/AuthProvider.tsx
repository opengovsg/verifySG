import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useToast } from '@opengovsg/design-system-react'
import { getApiErrorMessage } from '@services/ApiService'
import { AuthService } from '@services/AuthService'
import { AxiosError } from 'axios'

import { AuthContext } from './AuthContext'

interface AuthProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [officerEmail, setOfficerEmail] = useState('')
  const [officerAgency, setOfficerAgency] = useState('')
  const toast = useToast()

  const initOfficerInfo = useCallback(async (): Promise<void> => {
    await AuthService.whoAmI()
      .then((officerWhoamiResDto) => {
        setIsAuthenticated(officerWhoamiResDto.authenticated)
        // return early if officer is not authenticated
        if (!officerWhoamiResDto.authenticated) return
        // TypeScript discriminated union can infer officerWhoamiResDto is OfficerWhoamiSuccess
        setOfficerEmail(officerWhoamiResDto.email)
        setOfficerAgency(officerWhoamiResDto.agencyShortName)
      })
      .catch((error: AxiosError) => {
        toast({
          title: 'Error',
          description: getApiErrorMessage(error),
          status: 'warning',
        })
      })
  }, [toast])

  useEffect(() => {
    void initOfficerInfo()
  }, [initOfficerInfo])

  const logout = async (): Promise<void> => {
    await AuthService.logout()
      .then(() => {
        setIsAuthenticated(false)
        setOfficerEmail('')
        setOfficerAgency('')
      })
      .catch((error: AxiosError) => {
        toast({
          title: 'Error',
          description: getApiErrorMessage(error),
          status: 'warning',
        })
      })
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        officerEmail,
        officerAgency,
        initOfficerInfo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
