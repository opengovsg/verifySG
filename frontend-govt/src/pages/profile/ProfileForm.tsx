import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { FormControl, Text, VStack } from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  InlineMessage,
  Input,
  useToast,
} from '@opengovsg/design-system-react'

import HeaderContainer from '../../components/HeaderContainer'
import { OfficerService } from '../../services/OfficerService'

interface ProfileFormData {
  name: string
  position: string
}

interface ProfileFormProps {
  onSubmit?: () => void
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  // use form hooks
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
  } = useForm<ProfileFormData>()
  const toast = useToast()

  // query hooks to retrieve and mutate data
  const { data: profile } = useQuery('profile', OfficerService.getOfficer, {
    onSuccess: (profile) => {
      // update form only if no user edits have been made
      if (profile && !isDirty) {
        setValue('name', profile.name || '')
        setValue('position', profile.position || '')
      }
    },
  })

  const updateProfile = useMutation(OfficerService.updateOfficer, {
    onSuccess: () => {
      toast({
        status: 'success',
        description: 'Profile successfully updated!',
      })
      onSubmit?.()
    },
    onError: (err) => {
      toast({
        status: 'warning',
        description: `${err}` || 'Something went wrong',
      })
    },
  })

  // handle submission logic
  const submissionHandler = (data: ProfileFormData) => {
    updateProfile.mutate(data)
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
          Your **name**, **position**, and **agency** will be visible to the
          member of the public when they receive a notification that you will be
          calling them.
        </InlineMessage>
        <form onSubmit={handleSubmit(submissionHandler)}>
          <VStack spacing="32px" w="448px">
            <FormControl isDisabled>
              <FormLabel isRequired>Your agency / organisation</FormLabel>
              <Input placeholder={profile?.agency.name} />
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
            <FormControl isInvalid={!!errors.position}>
              <FormLabel isRequired>Your position</FormLabel>
              <Input
                {...register('position', {
                  required: 'Please enter a valid position',
                })}
                placeholder="e.g. Senior Manager"
              />
              {errors.position && (
                <FormErrorMessage>{errors.position.message}</FormErrorMessage>
              )}
            </FormControl>
            <Button type="submit">Save</Button>
          </VStack>
        </form>
      </VStack>
    </HeaderContainer>
  )
}
