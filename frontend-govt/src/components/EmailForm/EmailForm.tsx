import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Box, FormControl, Text, VStack } from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@opengovsg/design-system-react'

import { AuthService } from '../../services/AuthService'

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
    formState: { errors },
    setError,
    watch,
  } = useForm<EmailFormData>()

  const { email } = watch()

  // login form handlers
  const sendOtp = useMutation(AuthService.getOtp, {
    onSuccess: () => onSubmit(email),
    onError: (err: string) =>
      setError('email', { type: 'custom', message: err }),
  })

  const submissionHandler = (data: EmailFormData) => {
    const { email } = data
    sendOtp.mutate({ email })
  }

  // error handler stubs
  const hasError = (): boolean => !!errors.email?.message

  return (
    <form onSubmit={handleSubmit(submissionHandler)}>
      <VStack spacing={8} align="stretch">
        <FormControl id="email" isInvalid={hasError()}>
          <FormLabel mb={0} isRequired>
            Email
          </FormLabel>
          <Text color="neutral.700" mb={3}>
            Only whitelisted <strong>gov.sg</strong> emails can log in while
            this product is in beta. Please contact us for access.
          </Text>
          <Input
            {...register('email', {
              required: true,
              // TODO: refactor regexp into shared directory (1/2)
              pattern: {
                value: new RegExp(
                  "[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+.gov.sg",
                ),
                message: 'Please provide a valid .gov.sg email address.',
              },
            })}
            placeholder="e.g. benjamin_tan@spf.gov.sg"
            autoFocus
          />
          {hasError() && (
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
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
