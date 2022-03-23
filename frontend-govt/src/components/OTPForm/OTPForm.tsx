import React, { useEffect, useRef, useState } from 'react'
import { FormControl, VStack, Text, HStack } from '@chakra-ui/react'
import {
  Button,
  FormLabel,
  FormErrorMessage,
} from '@opengovsg/design-system-react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../contexts/auth/AuthContext'
import { OTPInput } from './OTPInput'
import { AuthService } from '../../services/AuthService'
import { useMutation } from 'react-query'

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
  const [isEditing, setIsEditing] = useState(false)

  // specify OTP input ref for resetting focus on field reset
  const otpInputRef = useRef<HTMLInputElement>(null)

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
    setValue,
    getValues,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFormData>()

  // register token field on mount
  useEffect(() => {
    register('token', { required: true, pattern: /\d{6}/ })
  }, [])

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
  const onSubmitInvalid = () => setIsEditing(false)
  const triggerSubmit = handleSubmit(submissionHandler, onSubmitInvalid)

  // otp input handlers
  const handleChange = (token: string) => {
    setValue('token', token, { shouldValidate: true })
  }
  const handleBlur = (token: string) => {
    // if token is empty, user is likely still editing the otp
    if (token !== '') setIsEditing(false)
  }
  const handleFocus = () => setIsEditing(true)

  // error handler stubs
  const hasError = (): boolean => !!errors.token || verifyOtp.isError
  const showError = isEditing ? false : hasError()
  const getErrorMessage = (): string => {
    return errors && errors.token
      ? 'Please provide a valid OTP'
      : `${verifyOtp.error}`
  }

  return (
    <form onSubmit={triggerSubmit}>
      <VStack spacing={8} align="stretch">
        <FormControl id="token" isInvalid={hasError()}>
          <FormLabel isRequired>One time password</FormLabel>
          <Text color="neutral.700" mb={3}>
            Please enter the OTP sent to <strong>{email}</strong>
          </Text>
          <OTPInput
            ref={otpInputRef}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onComplete={() => triggerSubmit()}
            isInvalid={showError}
            value={getValues('token')}
          />
          {showError && <FormErrorMessage children={getErrorMessage()} />}
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
