import { VStack, Text, FormControl } from '@chakra-ui/react'
import {
  Button,
  FormLabel,
  InlineMessage,
  Input,
  FormErrorMessage,
} from '@opengovsg/design-system-react'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import nric from 'nric'
import HeaderContainer from '../../components/HeaderContainer'

interface CallFormData {
  nricFin: string
  phoneNumber: string
}

interface CallFormProps {
  onSubmit?: (data: CallFormData) => void
}

export const CallForm: React.FC<CallFormProps> = ({ onSubmit }) => {
  // use form hooks
  const {
    register,
    // setValue,
    // watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<CallFormData>()

  // handle submission logic
  const submissionHandler = (data: CallFormData) => {
    onSubmit?.(data)
  }

  // register phone number input programmatically
  useEffect(() => {
    register('phoneNumber', {
      required: 'Please enter a valid phone number',
      pattern: {
        // temporary validation regex adapted from https://ihateregex.io/expr/phone/
        value: /[\+]?[0-9]{3}[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/,
        message: 'Please enter a valid phone number',
      },
    })
  }, [register])

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
          notification that you will be calling them shortly. The notification
          will also show your name, and the purpose of your call.
        </InlineMessage>
        <form onSubmit={handleSubmit(submissionHandler)}>
          <VStack spacing="32px" w="448px">
            <FormControl isInvalid={!!errors.nricFin}>
              <FormLabel isRequired>NRIC / FIN</FormLabel>
              <Input
                {...register('nricFin', {
                  required: 'Please enter a valid NRIC / FIN',
                  validate: {
                    valid: (v) =>
                      nric.validate(v) || 'Please enter a valid NRIC / FIN',
                  },
                })}
                placeholder="e.g. S1234567D"
              />
              {errors.nricFin && (
                <FormErrorMessage>{errors.nricFin.message}</FormErrorMessage>
              )}
            </FormControl>
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
