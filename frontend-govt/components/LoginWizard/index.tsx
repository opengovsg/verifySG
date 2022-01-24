import {
  Input,
  Heading,
  Text,
  Box,
  VStack,
  FormControl,
  FormHelperText,
  Button,
  HStack,
  PinInputField,
  PinInput,
} from '@chakra-ui/react'

import { ChangeEventHandler, useCallback, useContext, useState } from 'react'
import { AuthContext } from '../../contexts/AuthProvider'

interface loginState {
  email: string
  otp: number
}

const LoginWizard = () => {
  // login section is used to tell LoginWizard which part of the login to render
  const [loginSection, setLoginSection] = useState(1)
  const handleLoginSection = () => {
    setLoginSection((section) => section + 1)
  }

  return (
    <Box>
      {loginSection == 1 && (
        <EmailSection
          loginSection={loginSection}
          handleLoginSection={handleLoginSection}
        />
      )}

      {loginSection == 2 && (
        <OTPSection
        />
      )}
    </Box>
  )
}

interface EmailSectionProps {
  loginSection: number
  handleLoginSection: () => void
}

const EmailSection = ({
  loginSection,
  handleLoginSection,
}: EmailSectionProps) => {
  const [email, setEmail] = useState('')

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)
    

  return (
    <VStack align="left">
      <Box>
        <Heading size='xl'>Log in</Heading>
      </Box>

      <Box>
        <Text>Please log in with your gov.sg email address</Text>
      </Box>

      <Box>
        <FormControl>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            isRequired
            placeholder='Email'
          />
          <FormHelperText>
            Please input your government associated email
          </FormHelperText>

          <Box paddingTop={2}>
            <Button colorScheme={'brand'} onClick={handleLoginSection}>
              Get OTP
            </Button>
          </Box>
        </FormControl>
      </Box>
    </VStack>
  )
}

const OTPSection = () => {
  const [isDisabled, setIsDisabled] = useState(true)
  const [otpPin, setOtpPin] = useState('')
  const {setAuthState} = useContext(AuthContext);

  const handlePinChange = (pin: string) => {
    setOtpPin(pin)
    setIsDisabled(pin.length !== 6);
  }

  const handleSubmitOtp = () => {
    setAuthState({
      isAuthenticated: true,
      email: "example@gmail.com",
      name: "Austin Woon",
      _id: "12390812390812309"
    })
  }

  return (
    <VStack align="left" padding={10}>
      <Box>
        <Heading size='xl'>Verification Code</Heading>
      </Box>

      <Box>
        <Text>Please enter 6 Digit OTP</Text>
      </Box>

      <HStack>
        <PinInput otp onChange={handlePinChange}>
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
        </PinInput>
      </HStack>

      <Button isDisabled={isDisabled} colorScheme='brand' onClick={handleSubmitOtp}>
        Submit
      </Button>
    </VStack>
  )
}

export default LoginWizard
