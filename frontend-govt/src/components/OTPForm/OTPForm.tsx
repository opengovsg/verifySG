import React, { useEffect, useState } from 'react'
import { FormControl, VStack, Text, HStack } from '@chakra-ui/react'
import {
  Button,
  FormLabel,
  FormErrorMessage,
  Input,
} from '@opengovsg/design-system-react'
import { useForm } from 'react-hook-form'
import useAuth from '../../contexts/AuthProvider/useAuth'

interface OTPFormProps {
  email: string
  onLogin: () => void
}

interface OTPFormData {
  token: string
}

// controls the OTP resend cooldown time
const RESEND_WAIT_TIME = 30000 // 30 seconds

export const OTPForm: React.FC<OTPFormProps> = ({ email, onLogin }) => {
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_TIME / 1000)

  // import auth context
  const { authState, setAuthState } = useAuth()

  // otp resend timer side-effect
  useEffect(() => {
    let timeout: NodeJS.Timeout
    let interval: NodeJS.Timeout

    // reset timers
    if (!canResend) {
      interval = setInterval(() => {
        setResendTimer((t) => Math.max(t - 1, 0))
      }, 1000)

      timeout = setTimeout(() => {
        setCanResend(true)
        clearInterval(interval)
      }, RESEND_WAIT_TIME)
    }

    // cleanup function
    return () => {
      timeout && clearTimeout(timeout)
      interval && clearInterval(interval)
    }
  }, [canResend])

  // react-hook-form controllers
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormData>()

  // handle OTP resending
  const resendOTP = () => {
    setResendTimer(RESEND_WAIT_TIME / 1000)
    setCanResend(false)
  }

  // login form handlers
  const onSubmit = (data: OTPFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token } = data
    //TODO: use token in auth login flow

    // trigger onSuccess for now, instant login
    setAuthState({ ...authState, isAuthenticated: true, email: email })
    onLogin()
  }

  // error handler stubs
  //TODO: implement error handling for auth service, email validation
  const hasError = () => (errors.token ? true : false)
  const getErrorMessage = (): string => {
    return 'Please provide a valid email address.'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={8} align="stretch">
        <FormControl id="token" isInvalid={hasError()}>
          <FormLabel isRequired>One time password</FormLabel>
          <Text color="neutral.700" mb={3}>
            Please enter the OTP sent to <strong>{email}</strong>
          </Text>
          <Input
            h="48px"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            {...register('token', { required: true })}
            autoComplete="one-time-code"
            placeholder="e.g. 111111"
          />
          {hasError() && (
            <FormErrorMessage>{getErrorMessage()}</FormErrorMessage>
          )}
        </FormControl>
        <HStack justifyContent="flex-start" spacing={6}>
          <Button size="lg" colorScheme="primary" type="submit">
            Log in
          </Button>
          <Button
            variant="link"
            disabled={!canResend}
            //TODO: add otp resend logic and call otp resend function on logic completion
            onClick={resendOTP}
          >
            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}
