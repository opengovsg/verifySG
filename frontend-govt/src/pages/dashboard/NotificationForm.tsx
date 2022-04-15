import React from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { FormControl, Text, VStack } from '@chakra-ui/react'
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
import { NotificationService } from '../../services/NotificationService'

interface NotificationFormData {
  nric: string
  callScope?: string
  // phoneNumber: string
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
  const toast = useToast()

  // handle submission logic
  const submissionHandler = (data: NotificationFormData) => {
    createNotification.mutate(data)
  }

  // register phone number input programmatically
  // useEffect(() => {
  //   register('phoneNumber', {
  //     required: 'Please enter a valid phone number',
  //     pattern: {
  //       // temporary validation regex adapted from https://ihateregex.io/expr/phone/
  //       value: /[\+]?[0-9]{3}[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/,
  //       message: 'Please enter a valid phone number',
  //     },
  //   })
  // }, [register])

  // query hook to mutate data
  const createNotification = useMutation(
    NotificationService.createNotification,
    {
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
    },
  )

  // handle change for phone number input
  // const handleChange = (newVal?: string) => {
  //   // prevent infinite feedback loop
  //   watch('phoneNumber')
  //     ? setValue('phoneNumber', newVal || '')
  //     : newVal && setValue('phoneNumber', newVal)
  // }

  return (
    <HeaderContainer>
      <VStack mt="64px" spacing="32px">
        <Text textStyle="h2" color="#1B3C87">
          Enter the details of the person you need to call
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
          When you click the ‘Notify call recipient’ button, they will receive a
          Singpass push notification that you will be calling them shortly. The
          notification will also show your name, your position, and the purpose
          of your call.
        </InlineMessage>
        <form onSubmit={handleSubmit(submissionHandler)}>
          <VStack spacing="32px" w="448px">
            <FormControl isInvalid={!!errors.nric}>
              <FormLabel isRequired>NRIC / FIN</FormLabel>
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
              />
              {errors.nric && (
                <FormErrorMessage>{errors.nric.message}</FormErrorMessage>
              )}
            </FormControl>
            {/* <FormControl isInvalid={!!errors.callScope}>
              <FormLabel>Purpose for call</FormLabel>
              <Input
                {...register('callScope')}
                placeholder="e.g. Police Report"
              />
              {errors.callScope && (
                <FormErrorMessage>{errors.callScope.message}</FormErrorMessage>
              )}
            </FormControl> */}
            {/* <FormControl isInvalid={!!errors.phoneNumber}>
            <FormLabel isRequired>Phone number</FormLabel>
            <PhoneNumberInput
              isInvalid={!!errors.phoneNumber}
              value={watch('phoneNumber', '')}
              onChange={handleChange}
              examplePlaceholder="polite"
            />
            {errors.phoneNumber && (
              <FormErrorMessage>{errors.phoneNumber.message}</FormErrorMessage>
            )}
          </FormControl> */}
            <VStack spacing="16px">
              <Button type="submit">Notify call recipient</Button>
              <Button variant="link" onClick={() => reset()} type="reset">
                Clear details
              </Button>
            </VStack>
          </VStack>
        </form>
      </VStack>
    </HeaderContainer>
  )
}
