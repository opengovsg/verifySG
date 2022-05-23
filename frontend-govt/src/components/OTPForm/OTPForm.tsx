import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { FormControl, HStack, Input, Text, VStack } from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  FormLabel,
} from '@opengovsg/design-system-react'

import { useAuth } from '../../contexts/auth/AuthContext'
import { AuthService } from '../../services/AuthService'

interface OTPFormProps {
  email: string
  onSubmit: () => void
}

interface OTPFormData {
  token: string
}

// controls the OTP resend cooldown time
const RESEND_WAIT_TIME = 30000 // 30 seconds

export const OTPForm: React.FC<OTPFormProps> = ({ email, onSubmit }) => {
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(RESEND_WAIT_TIME / 1000)

  // import auth context
  const { getOfficer } = useAuth()

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
    AuthService.getOtp({ email })
    setResendTimer(RESEND_WAIT_TIME / 1000)
    setCanResend(false)
  }

  // login form handlers
  const verifyOtp = useMutation(AuthService.verifyOtp, {
    onSuccess: async () => {
      await getOfficer()
      onSubmit()
    },
  })

  const submissionHandler = (data: OTPFormData) => {
    const { token } = data
    verifyOtp.mutate({ email, token })
  }
  const triggerSubmit = handleSubmit(submissionHandler)

  // error handler stubs
  const hasError = (): boolean => !!errors.token || verifyOtp.isError
  const getErrorMessage = (): string => {
    return errors && errors.token
      ? 'Please provide a valid OTP'
      : `${verifyOtp.error}`
  }

  return (
    <form onSubmit={triggerSubmit}>
      <VStack spacing={8} align="stretch">
        <FormControl id="token" isInvalid={hasError()}>
          <FormLabel isRequired>One-time password</FormLabel>
          <Text color="neutral.700" mb={3}>
            Enter OTP sent to {email}
          </Text>
          <Input
            h="48px"
            {...register('token', {
              required: true,
              minLength: 6,
              maxLength: 6,
              pattern: /^\d{6}/,
            })}
            autoComplete="one-time-code"
            placeholder="e.g. 111111"
            autoFocus
          />
          <FormErrorMessage children={getErrorMessage()} />
        </FormControl>
        <HStack justifyContent="flex-start" spacing={6}>
          <Button size="lg" bgColor="primary" type="submit">
            Log in
          </Button>
          <Button
            variant="link"
            disabled={!canResend}
            //TODO: add otp resend logic and call otp resend function on logic completion
            onClick={resendOTP}
          >
            {canResend ? 'Resend OTP?' : `Resend in ${resendTimer}s`}
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}
