import React from 'react'
import { FormControl, VStack, Text, Box } from '@chakra-ui/react'
import {
  Button,
  FormLabel,
  FormErrorMessage,
  Input,
} from '@opengovsg/design-system-react'
import { useForm } from 'react-hook-form'

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
  } = useForm<EmailFormData>()

  // login form handlers
  const submissionHandler = (data: EmailFormData) => {
    const { email } = data
    //TODO: use email in auth login flow

    // trigger onSuccess for now
    onSubmit(email)
  }

  // error handler stubs
  //TODO: implement error handling for auth service, email validation
  const hasError = () => (errors.email ? true : false)
  const getErrorMessage = (): string => {
    return 'Please provide a valid email address.'
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
