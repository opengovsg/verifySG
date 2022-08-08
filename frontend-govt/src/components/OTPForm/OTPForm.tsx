import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { FormControl, HStack, Input, Text, VStack } from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  FormLabel,
} from '@opengovsg/design-system-react'
import { AuthService } from '@services/AuthService'

import { useAuth } from '@/contexts/auth/AuthContext'

interface OTPFormProps {
  email: string
  onSubmit: () => void
}

interface OTPFormData {
  otp: string
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
    formState: { errors, isSubmitting },
    setError,
  } = useForm<OTPFormData>()

  // handle OTP resending
  const resendOTP = () => {
    AuthService.getOtp({ email })
    setResendTimer(RESEND_WAIT_TIME / 1000)
    setCanResend(false)
  }

  const INVALID_OTP = 'Please provide a valid OTP.'

  const validateOTP = useCallback((otp: string) => {
    return isValidSixDigitOTP(otp) || INVALID_OTP
  }, [])

  const isValidSixDigitOTP = (otp: string): boolean => {
    return !!otp.match('^[0-9]{6}$')
  }

  // login form handlers
  const verifyOtp = useMutation(AuthService.verifyOtp, {
    onSuccess: async () => {
      await getOfficer()
      onSubmit()
    },
    onError: (err: string) => {
      setError('otp', {
        type: 'server',
        message: err,
      })
    },
  })

  const submissionHandler = (data: OTPFormData) => {
    const { otp } = data
    verifyOtp.mutate({ email, otp })
  }
  const triggerSubmit = handleSubmit(submissionHandler)

  return (
    <form onSubmit={triggerSubmit}>
      <VStack spacing={8} align="stretch">
        <FormControl
          id="otp"
          isInvalid={!!errors.otp}
          isReadOnly={isSubmitting}
        >
          <FormLabel mb={0} isRequired>
            One-time password
          </FormLabel>
          <Text color="neutral.700" mb={3}>
            Enter OTP sent to {email}
          </Text>
          <Input
            h="48px"
            {...register('otp', {
              required: INVALID_OTP,
              validate: validateOTP,
            })}
            autoComplete="one-time-code"
            placeholder="e.g. 111111"
            autoFocus
          />
          {errors.otp && (
            <FormErrorMessage>{errors.otp.message}</FormErrorMessage>
          )}
        </FormControl>
        <HStack justifyContent="flex-start" spacing={6}>
          <Button type="submit">Log in</Button>
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
