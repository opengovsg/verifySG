import { VStack, Text, FormControl } from '@chakra-ui/react'
import {
  Button,
  FormLabel,
  InlineMessage,
  Input,
  FormErrorMessage,
} from '@opengovsg/design-system-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import HeaderContainer from '../HeaderContainer'

interface ProfileFormData {
  agency: string
  name: string
  title: string
}

interface ProfileFormProps {
  onSubmit?: (data: ProfileFormData) => void
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  // use form hooks
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>()

  // handle submission logic
  const submissionHandler = (data: ProfileFormData) => {
    onSubmit?.(data)
  }

  return (
    <HeaderContainer>
      <VStack mt="64px" spacing="32px">
        <Text textStyle="h2" color="#1B3C87">
          Fill in your details to create your caller profile
        </Text>
        <InlineMessage
          variant="info"
          w="440px"
          useMarkdown
          // override internal theme style
          //TODO: shift these into theme folder for cleanup refactor
          sx={{
            padding: '8px',
            display: 'flex',
            p: '1rem',
            justifyContent: 'start',
            color: 'secondary.700',
            bg: '#EBEFFE',
          }}
        >
          Your **name**, **title**, and **agency** will be visible to the member
          of the public when they receive a notification that you will be
          calling them.
        </InlineMessage>
        <form onSubmit={handleSubmit(submissionHandler)}>
          <VStack spacing="32px" w="448px">
            <FormControl isInvalid={!!errors.agency}>
              <FormLabel isRequired>Your agency / organisation</FormLabel>
              <Input
                {...register('agency', {
                  required: 'Please enter a valid agency',
                })}
                placeholder="e.g. Singapore Police Force (SPF)"
              />
              {errors.agency && (
                <FormErrorMessage>{errors.agency.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel isRequired>Your name</FormLabel>
              <Input
                {...register('name', {
                  required: 'Please enter a valid name',
                })}
                placeholder="e.g. Alex Tan"
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
            <FormControl isInvalid={!!errors.title}>
              <FormLabel isRequired>Your title</FormLabel>
              <Input
                {...register('title', {
                  required: 'Please enter a valid title',
                })}
                placeholder="e.g. Senior Manager"
              />
              {errors.title && (
                <FormErrorMessage>{errors.title.message}</FormErrorMessage>
              )}
            </FormControl>
            <Button type="submit">Save</Button>
          </VStack>
        </form>
      </VStack>
    </HeaderContainer>
  )
}
