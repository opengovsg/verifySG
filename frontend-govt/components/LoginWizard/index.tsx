import {
  Input,
  Heading,
  Text,
  Box,
  VStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Button,
  HStack,
  PinInputField,
  PinInput,
} from '@chakra-ui/react'
import { PhoneIcon } from '@chakra-ui/icons'

import { Formik } from 'formik'
import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react'
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
    <VStack>
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
    </VStack>
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

  const handleEmailChange = useCallback(
    (e) => {
      setEmail(e.target.value)
    },
    [email],
  )

  return (
    <VStack align="left" padding={10}>
      <Box>
        <Heading>Log In</Heading>
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
            <Button colorScheme={'teal'} onClick={handleLoginSection}>
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

  const handleOnComplete = () => {
    setIsDisabled(false)
  }

  const handlePinChange = (pin: string) => {
    setOtpPin(pin)
  }

  const handleSubmitOtp = () => {
    setAuthState({
      isAuthenticated: true,
      email: "example@gmail.com",
      name: "Austin Woon",
      _id: "12390812390812309"
    })
  }

  useEffect(() => {
    if (otpPin.length < 6) {
      setIsDisabled(true)
    }
  }, [otpPin])

  return (
    <VStack align="left" padding={10}>
      <Box>
        <Heading>Verification Code</Heading>
      </Box>

      <Box>
        <Text>Please enter 6 Digit OTP</Text>
      </Box>

      <HStack>
        <PinInput otp onComplete={handleOnComplete} onChange={handlePinChange}>
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
          <PinInputField />
        </PinInput>
      </HStack>

      <Button isDisabled={isDisabled} colorScheme='teal' onClick={handleSubmitOtp}>
        Submit
      </Button>
    </VStack>
  )
}

export default LoginWizard
