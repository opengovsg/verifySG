import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Box, FormControl, Heading, Text, VStack } from '@chakra-ui/react'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  InlineMessage,
  Input,
  useToast,
} from '@opengovsg/design-system-react'
import nric from 'nric'

import HeaderContainer from '../../components/HeaderContainer'
import { FEEDBACKFORM_ROUTE } from '../../constants/routes'
import { useNotificationData } from '../../contexts/notification/NotificationDataContext'
import { NotificationService } from '../../services/NotificationService'

interface NotificationFormData {
  nric: string
  callScope?: string
}

interface NotificationFormProps {
  onSubmit?: (data: NotificationFormData) => void
}

export const NotificationForm: React.FC<NotificationFormProps> = () => {
  // use form hooks
  const {
    register,
    watch,
    trigger,
    clearErrors,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<NotificationFormData>()
  const { setTargetNRIC } = useNotificationData()

  const toast = useToast()
  const history = useHistory()

  // handle submission logic
  const submissionHandler = (data: NotificationFormData) => {
    sendNotification.mutate(data, {
      // only update notif context and send user to feedback form when notification is sent successfully
      onSuccess: () => {
        setTargetNRIC(data.nric)
        history.push(FEEDBACKFORM_ROUTE)
      },
    })
  }

  // query hook to mutate data
  const sendNotification = useMutation(NotificationService.sendNotification, {
    onSuccess: () => {
      toast({
        status: 'success',
        description: `Notification sent to ${watch('nric')}`,
      })
    },
    onError: (err) => {
      toast({
        status: 'warning',
        description: `${err}` || 'Something went wrong',
      })
    },
  })

  return (
    <HeaderContainer>
      <VStack
        width={'100%'}
        maxWidth="500px"
        px={[3, 3, 4, 4]}
        spacing={[5, 5, 6, 6]}
      >
        <Heading fontSize={['xl', 'xl', '2xl', '2xl']} color="primary.500">
          Enter the details of the person you need to call
        </Heading>
        <InlineMessage
          variant="info"
          w="100%"
          fontSize={['sm', 'sm', 'md', 'md']}
          useMarkdown
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
          When you click the ‘Notify call recipient’ button, they will receive a
          Singpass push notification that you will be calling them shortly. The
          notification will also show your name, your position, and the purpose
          of your call.
        </InlineMessage>
        <Box width="100%">
          <form onSubmit={handleSubmit(submissionHandler)}>
            <VStack spacing={[3, 3, 4, 4]} align="left">
              <FormControl isInvalid={!!errors.nric}>
                <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                  NRIC / FIN
                </FormLabel>
                <Input
                  {...register('nric', {
                    required: 'Please enter a valid NRIC / FIN',
                    validate: {
                      valid: (v) =>
                        nric.validate(v) || 'Please enter a valid NRIC / FIN',
                    },
                  })}
                  onBlur={() => {
                    trigger('nric')
                  }}
                  onFocus={() => {
                    clearErrors('nric')
                  }}
                  placeholder="e.g. S1234567D"
                  autoFocus
                />
                {errors.nric && (
                  <FormErrorMessage>{errors.nric.message}</FormErrorMessage>
                )}
              </FormControl>

              <VStack spacing={[3, 3, 4, 4]} align="left">
                <Button
                  type="submit"
                  isLoading={sendNotification.isLoading}
                  loadingText="Notifying..."
                  bgColor="primary"
                >
                  Notify call recipient
                </Button>
                <Button variant="link" onClick={() => reset()} type="reset">
                  Clear details
                </Button>
              </VStack>
            </VStack>
          </form>
        </Box>
      </VStack>
    </HeaderContainer>
  )
}
