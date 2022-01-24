import { Spinner, VStack } from '@chakra-ui/react'
import React, { useContext, useState } from 'react'
import { AuthContext } from '../../contexts/AuthProvider'
import SingpassLoginButton from '../SingpassLoginButton'

const LoginWizard = () => {
  const { setAuthState } = useContext(AuthContext)

  const [loginSection, setLoginSection] = useState(1)
  const handleLoginSection = () => {
    setLoginSection((section) => section + 1)
  }
  return (
    <VStack align="left" padding={10}>
      {loginSection == 1 && (
        <PreLoginSection handleLoginSection={handleLoginSection} />
      )}

      {loginSection == 2 && (
        <RedirectSection
          loginCallback={() => {
            setAuthState({
              isAuthenticated: true,
              email: 'example@gmail.com',
              name: 'John Doe',
              _id: '15151511515151',
            })
            console.log('redirected!')
          }}
        />
      )}
    </VStack>
  )
}

interface PreLoginSectionProps {
  handleLoginSection: () => void
}
const PreLoginSection = ({ handleLoginSection }: PreLoginSectionProps) => {
  return (
    <>
      <h2>
        Check if the person calling you is an authorised government
        representative
      </h2>
      <SingpassLoginButton
        buttonOnClick={() => {
          handleLoginSection()
        }}
      ></SingpassLoginButton>
      <ul>
        <li>
          Log in with Singpass - if this person is authorised to call you, you
          will be able to see their identity
        </li>
        <li>
          <b>Do not share any personal information</b> unless you have confirmed
          the caller is authorised
        </li>
        <li>
          If the caller is not authorised, please report it via ScamShield and
          help prevent scams
        </li>
      </ul>
    </>
  )
}

interface RedirectSectionProps {
  loginCallback: () => void
}
const RedirectSection = ({ loginCallback }: RedirectSectionProps) => {
  setTimeout(loginCallback, 2000)
  return (
    <>
      <Spinner color="teal" />
      <h2>Please wait...</h2>
      <div>You're being redirected to Singpass. It may take a few seconds.</div>
      <div>Please do not refresh or exit this page.</div>
    </>
  )
}

export default LoginWizard
