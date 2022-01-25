import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Center, Spinner } from '@chakra-ui/react'

import { LOGGED_IN_KEY } from 'constants/localStorage'
import { useLocalStorage } from 'hooks/localStorage'
import { AuthService } from 'services'

export const CallbackPage = (): JSX.Element => {
  const { search } = useLocation()
  const urlSearchParams = new URLSearchParams(search)
  const params = Object.fromEntries(urlSearchParams.entries())
  const { code, state } = params
  console.log('on callback page', code, state)
  const [, setIsAuthenticated] = useLocalStorage<boolean>(LOGGED_IN_KEY)

  useEffect(() => {
    const login = async () => {
      await AuthService.verifyLogin({ code, state })
      await AuthService.whoAmI()
      setIsAuthenticated(true)
    }
    login()
    console.log('hi')
  }, [setIsAuthenticated, code, state])

  return (
    <Center>
      <Spinner />
    </Center>
  )
}
