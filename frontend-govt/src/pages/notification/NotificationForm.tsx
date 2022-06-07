import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import Select, { SingleValue } from 'react-select'
import { Box, FormControl, Heading, StackItem, VStack } from '@chakra-ui/react'
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
import MessagePreview from '../../components/MessagePreview'
import { FEEDBACKFORM_ROUTE } from '../../constants/routes'
import { useNotificationData } from '../../contexts/notification/NotificationDataProvider'
import { NotificationService } from '../../services/NotificationService'
import { PurposeService } from '../../services/PurposeService'

interface NotificationFormData {
  nric: string
  purposeId: string
}

interface NotificationFormProps {
  onSubmit?: (data: NotificationFormData) => void
}

interface PurposeOption {
  // shape for React Select options
  value: string // purposeId
  label: string // menuDescription
}

export const NotificationForm: React.FC<NotificationFormProps> = () => {
  const {
    register,
    watch,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NotificationFormData>({
    mode: 'onTouched', // to validate NRIC before submission; default is onSubmit
  })
  const { setTargetNRIC, setPurposeDescription } = useNotificationData()
  const toast = useToast({
    isClosable: true,
    containerStyle: {
      width: '680px',
      maxWidth: '100%',
    },
    duration: 6000,
  })
  const history = useHistory()
  const { data: purposes } = useQuery('purposes', PurposeService.getAllPurposes)

  const purposeOptions = // convert purposes to purposeOptions for React Select
    purposes?.map((purpose) => {
      return {
        value: purpose.purposeId,
        label: purpose.menuDescription,
      }
    }) ?? []
  const getPurposeOptionByValue = (
    comparisonValue: string,
  ): PurposeOption | undefined => {
    return purposeOptions.find((option) => option.value === comparisonValue)
  }
  const isPurposeChosen = (selectedOption: string): boolean => {
    return getPurposeOptionByValue(selectedOption) !== undefined
  }

  const submissionHandler = (data: NotificationFormData) => {
    sendNotification.mutate(data, {
      // only update notif context and send user to feedback form when notification is sent successfully
      onSuccess: () => {
        setTargetNRIC(data.nric)
        setPurposeDescription(getPurposeOptionByValue(data.purposeId)?.label)
        history.push(FEEDBACKFORM_ROUTE)
      },
    })
  }

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
      <Heading
        fontSize={['xl', 'xl', '2xl', '2xl']}
        color="primary.500"
        mb={[4, 4, 8, 8]}
      >
        Enter the details of the person you need to call
      </Heading>
      <VStack
        width={'100%'}
        maxWidth="500px"
        px={[3, 3, 4, 4]}
        spacing={[4, 4, 8, 8]}
        pb={20}
      >
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
            <VStack align="left" spacing={[8, 8, 8, 8]}>
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
                  placeholder="e.g. S1234567D"
                  autoFocus
                />
                {errors.nric && (
                  <FormErrorMessage>{errors.nric.message}</FormErrorMessage>
                )}
              </FormControl>
              {purposeOptions.length > 0 && (
                <FormControl isInvalid={!!errors.purposeId}>
                  <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                    Purpose of Call
                  </FormLabel>
                  <Controller
                    name="purposeId"
                    control={control}
                    rules={{
                      validate: (v: string) =>
                        isPurposeChosen(v) || 'Please select a purpose',
                    }}
                    defaultValue={
                      // provide default value if only one option
                      purposeOptions.length === 1
                        ? purposeOptions[0].value
                        : undefined
                    }
                    render={({ field: { onChange, value } }) => (
                      <Select
                        options={purposeOptions}
                        value={getPurposeOptionByValue(value)}
                        onChange={(option: SingleValue<PurposeOption>) =>
                          onChange(option?.value)
                        }
                        // TODO: refactor theme somewhere else
                        theme={(theme) => {
                          return {
                            ...theme,
                            colors: {
                              ...theme.colors,
                              primary: '#1B3C87',
                            },
                          }
                        }}
                        placeholder="Type to search"
                      />
                    )}
                  />
                  {errors.purposeId && (
                    <FormErrorMessage>
                      {errors.purposeId.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              )}
              <StackItem>
                <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                  Message Preview
                </FormLabel>
                <MessagePreview nric={watch('nric') ?? ''} />
              </StackItem>
              <StackItem>
                <VStack spacing={[4, 4, 4, 4]}>
                  <Button
                    type="submit"
                    isLoading={sendNotification.isLoading}
                    loadingText="Notifying..."
                    width="100%"
                  >
                    Notify call recipient
                  </Button>
                  <Button
                    width="100%"
                    variant="link"
                    onClick={() => reset()}
                    type="reset"
                  >
                    Clear details
                  </Button>
                </VStack>
              </StackItem>
            </VStack>
          </form>
        </Box>
      </VStack>
    </HeaderContainer>
  )
}
