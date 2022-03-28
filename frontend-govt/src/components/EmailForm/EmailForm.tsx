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
    watch,
  } = useForm<EmailFormData>()

  const { email } = watch()

  // login form handlers
  const sendOtp = useMutation(AuthService.getOtp, {
    onSuccess: () => onSubmit(email),
  })

  const submissionHandler = (data: EmailFormData) => {
    const { email } = data
    sendOtp.mutate({ email })
  }

  // error handler stubs
  const hasError = (): boolean => !!errors.email || sendOtp.isError
  const getErrorMessage = (): string => {
    return errors && errors.email
      ? 'Please provide a valid email address.'
      : `${sendOtp.error}`
  }

  return (
    <form onSubmit={handleSubmit(submissionHandler)}>
      <VStack spacing={8} align="stretch">
        <FormControl id="email" isInvalid={hasError()}>
          <FormLabel isRequired>Login</FormLabel>
          <Text color="neutral.700" mb={3}>
            For use by public officers with a <strong>gov.sg</strong> email{' '}
            address
          </Text>
          <Input
            type="email"
            {...register('email', { required: true })}
            placeholder="e.g. jane@open.gov.sg"
          />
          {hasError() && (
            <FormErrorMessage>{getErrorMessage()}</FormErrorMessage>
          )}
        </FormControl>
        <Box>
          <Button size="lg" colorScheme="primary" type="submit">
            Log in
          </Button>
        </Box>
      </VStack>
    </form>
  )
}
