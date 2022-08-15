import React, { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Box, FormControl, Text, VStack } from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@opengovsg/design-system-react'
import { AuthService } from '@services/AuthService'

import {
  INVALID_GOV_SG_EMAIL,
  isGovtEmail,
  normalizeEmail,
} from '~shared/utils'

interface EmailFormProps {
  onSubmit: (email: string) => void
}

interface EmailFormData {
  email: string
}

export const EmailForm: React.FC<EmailFormProps> = ({ onSubmit }) => {
  // react-hook-form controllers
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError,
  } = useForm<EmailFormData>()

  const { email } = watch()

  const validateGovtEmail = useCallback((value: string) => {
    return isGovtEmail(value) || INVALID_GOV_SG_EMAIL
  }, [])

  // login form handlers
  const sendOtp = useMutation(AuthService.getOtp, {
    onSuccess: () => onSubmit(email),
    onError: (err: string) => {
      setError('email', {
        type: 'server',
        message: err,
      })
    },
  })

  const submissionHandler = (inputs: EmailFormData) => {
    const { email } = inputs
    const normalizedEmail = normalizeEmail(email)
    sendOtp.mutate({ email: normalizedEmail })
  }
  return (
    <form onSubmit={handleSubmit(submissionHandler)}>
      <VStack spacing={8} align="stretch">
        <FormControl
          id="email"
          isInvalid={!!errors.email}
          isReadOnly={isSubmitting}
        >
          <FormLabel mb={0} isRequired>
            Email
          </FormLabel>
          <Text color="neutral.700" mb={3}>
            Only whitelisted <strong>.gov.sg</strong> emails can log in while
            this product is in beta. Please contact us for access.
          </Text>
          <Input
            {...register('email', {
              required: INVALID_GOV_SG_EMAIL,
              validate: validateGovtEmail,
            })}
            placeholder="e.g. benjamin_tan@spf.gov.sg"
            autoFocus
          />
          {errors.email && (
            <FormErrorMessage>{errors.email.message}</FormErrorMessage>
          )}
        </FormControl>
        <Box>
          <Button isLoading={sendOtp.isLoading} type="submit">
            Get OTP
          </Button>
        </Box>
      </VStack>
    </form>
  )
}
