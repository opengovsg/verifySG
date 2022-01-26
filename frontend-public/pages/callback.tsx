import { useContext, useEffect, useState } from 'react'
import { Center, Spinner } from '@chakra-ui/react'

import { AuthService } from '../services'
import { useRouter } from 'next/router'
import { AuthContext } from '../contexts/AuthProvider'

const CallbackPage = (): JSX.Element => {
  const router = useRouter()
  const { code } = router.query
  const authContext = useContext(AuthContext)
  useEffect(() => {
    const login = async () => {
      console.log(`CallbackPage::useEffect, code: ${code}`)
      if (code) {
        await AuthService.verifyLogin({ code: code as string }).then(
          async () => {
            const { nric } = await AuthService.whoAmI()
            authContext.setAuthState({
              nric,
              isAuthenticated: true,
            })
            console.log('Done setting')
            router.push('/')
          },
          (err) => {
            console.log(err)
          },
        )
      }
    }
    login()
  }, [code, authContext, router])

  return (
    <Center>
      <Spinner />
    </Center>
  )
}

export default CallbackPage
