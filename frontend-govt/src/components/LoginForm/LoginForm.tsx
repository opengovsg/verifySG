import React from 'react'
import { FormControl, VStack, Text, Box } from '@chakra-ui/react'
import {
  Button,
  FormLabel,
  FormErrorMessage,
  Input,
} from '@opengovsg/design-system-react'
import { useForm } from 'react-hook-form'

interface LoginFormProps {
  onSuccess: (email: string) => void
}

interface LoginFormData {
  email: string
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  // react-hook-form controllers
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  // login form handlers
  const onSubmit = (data: LoginFormData) => {
    const { email } = data
    //TODO: use email in auth login flow

    // trigger onSuccess for now
    onSuccess(email)
  }

  // error handler stubs
  //TODO: implement error handling for auth service, email validation
  const hasError = () => (errors.email ? true : false)
  const getErrorMessage = (): string => {
    return 'Please provide a valid email address.'
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={8} align="stretch">
        <FormControl id="email" isInvalid={hasError()}>
          <FormLabel isRequired>Login</FormLabel>
          <Text color="neutral.700" mb={3}>
            For use by public officers with a <strong>gov.sg</strong> email{' '}
            address
          </Text>
          <Input
            h="48px"
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
