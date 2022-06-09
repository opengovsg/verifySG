import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { Box, FormControl, Heading, Skeleton, VStack } from '@chakra-ui/react'
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
  const toast = useToast({
    isClosable: true,
    containerStyle: {
      width: '680px',
      maxWidth: '100%',
    },
    duration: 6000,
  })

  // query hooks to retrieve and mutate data
  const { data: profile, isLoading } = useQuery(
    'profile',
    OfficerService.getOfficer,
    {
      onSuccess: (profile) => {
        // update form only if no user edits have been made
        if (profile && !isDirty) {
          setValue('name', profile.name || '')
          setValue('position', profile.position || '')
        }
      },
    },
  )

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
      <Heading
        fontSize={['xl', 'xl', '2xl', '2xl']}
        color="primary.500"
        mb={[4, 4, 8, 8]}
      >
        Fill in your details to create your caller profile
      </Heading>
      <VStack
        width="100%"
        px={[3, 3, 4, 4]}
        spacing={[4, 4, 8, 8]}
        maxWidth="500px"
        pb={20}
      >
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
            <VStack align="left" spacing={[8, 8, 8, 8]}>
              <FormControl isDisabled>
                <FormLabel fontSize={['md', 'md', 'lg', 'lg']} isRequired>
                  Your agency / organisation
                </FormLabel>
                <Skeleton isLoaded={!isLoading}>
                  <Input placeholder={profile?.agency.name} />
                </Skeleton>
              </FormControl>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontSize={['md', 'md', 'lg', 'lg']} isRequired>
                  Your name
                </FormLabel>
                <Skeleton isLoaded={!isLoading}>
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
                </Skeleton>
                {errors.name && (
                  <FormErrorMessage>{errors.name.message}</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid={!!errors.position}>
                <FormLabel fontSize={['md', 'md', 'lg', 'lg']} isRequired>
                  Your position
                </FormLabel>
                <Skeleton isLoaded={!isLoading}>
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
                </Skeleton>
                {errors.position && (
                  <FormErrorMessage>{errors.position.message}</FormErrorMessage>
                )}
              </FormControl>
              <Button type="submit" width="100%" bgColor={'primary'}>
                Save
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </HeaderContainer>
  )
}
