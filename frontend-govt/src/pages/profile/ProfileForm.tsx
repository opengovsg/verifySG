import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { Box, FormControl, Text, VStack } from '@chakra-ui/react'
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
      <VStack
        width="100%"
        px={[2, 2, 4, 4]}
        spacing={[4, 4, 6, 6]}
        maxWidth="500px"
      >
        <Text textStyle={['h3', 'h3', 'h2', 'h2']} color="primary">
          Fill in your details to create your caller profile
        </Text>
        <InlineMessage
          variant="info"
          useMarkdown
          fontSize={['sm', 'sm', 'md', 'md']}
          // override internal theme style
          //TODO: shift these into theme folder for cleanup refactor
          sx={{
            padding: '8px',
            display: 'flex',
            p: '1rem',
            justifyContent: 'start',
            color: 'secondary.700',
            bg: 'primary.200',
          }}
        >
          Your **name**, **position**, and **agency** will be visible to the
          member of the public when they receive a notification that you will be
          calling them.
        </InlineMessage>
        <Box width="100%">
          <form onSubmit={handleSubmit(submissionHandler)}>
            <VStack align="left" spacing={[2, 2, 4, 4]}>
              <FormControl isDisabled>
                <FormLabel fontSize={['md', 'md', 'lg', 'lg']} isRequired>
                  Your agency / organisation
                </FormLabel>
                <Input placeholder={profile?.agency.name} />
              </FormControl>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontSize={['md', 'md', 'lg', 'lg']} isRequired>
                  Your name
                </FormLabel>
                <Input
                  {...register('name', {
                    required: 'Please enter a valid name',
                    pattern: {
                      value: /^[A-Za-z ,.'-]+$/, // name validation
                      message: 'Please enter a valid name',
                    },
                  })}
                  placeholder="e.g. Benjamin Tan"
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
                    pattern: {
                      value: /^[\x00-\x7F]+$/, // ASCII validation
                      message: 'Please enter a valid position',
                    },
                  })}
                  placeholder="e.g. Senior Manager"
                />
                {errors.position && (
                  <FormErrorMessage>{errors.position.message}</FormErrorMessage>
                )}
              </FormControl>
              <Button type="submit" bgColor={'primary'}>
                Save
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </HeaderContainer>
  )
}
