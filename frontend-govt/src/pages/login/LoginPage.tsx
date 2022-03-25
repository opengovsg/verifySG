import React, { useState } from 'react'
import { Center, Flex, Image, VStack } from '@chakra-ui/react'
import { GovtMasthead } from '@opengovsg/design-system-react'
import EmailForm from '../../components/EmailForm'
import OTPForm from '../../components/OTPForm'

// import assets
import SignInSplash from '../../assets/SignInSplash.svg'
import Logo from '../../assets/CheckWhoLogo.svg'

interface LoginPageProps {
  onLogin?: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')

  return (
    <Flex direction="column" h="100vh" align="stretch">
      <GovtMasthead />
      <Flex flex={1} direction="row">
        <Center flex={1} bg="#1B3C87" display={{ base: 'none', lg: 'flex' }}>
          <Image src={SignInSplash} minWidth="480px" mr="-60%" />
        </Center>
        <Flex
          alignItems={{ base: 'flex-start', md: 'center' }}
          justifyContent="center"
          flex={2}
          padding={{ base: '64px 32px', md: 0 }}
        >
          <VStack
            w={{ base: '100%', md: '460px' }}
            align="stretch"
            spacing="48px"
          >
            <Image src={Logo} w={{ base: '273px' }} />
            {!email ? (
              <EmailForm onSubmit={(email) => setEmail(email)} />
            ) : (
              <OTPForm email={email} onSubmit={() => onLogin?.()} />
            )}
          </VStack>
        </Flex>
      </Flex>
    </Flex>
  )
}
