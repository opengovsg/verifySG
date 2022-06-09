import React, { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import Select, { SingleValue } from 'react-select'
import {
  Box,
  FormControl,
  Heading,
  Skeleton,
  StackItem,
  VStack,
} from '@chakra-ui/react'
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
import { SGNotifyTemplateParams } from '../../types/purpose'

interface NotificationFormData {
  nric: string
  purposeId: string
}

interface PurposeOption {
  // shape for React Select options
  value: string // purposeId
  label: string // menuDescription
}

const useNotificationForm = () => {
  const formMethods = useForm<NotificationFormData>({
    mode: 'onTouched', // to validate NRIC before submission; default is onSubmit
  })

  const { watch, reset, setValue, handleSubmit } = formMethods

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
  const { data: purposes, isLoading } = useQuery(
    ['purposes'], // query key must be in array in React 18
    PurposeService.getAllPurposes,
  )

  // load default value if response only contains a single purpose
  useEffect(() => {
    if (!isLoading && purposes?.length === 1) {
      // load default value on query load
      setValue('purposeId', purposes[0].purposeId)
    }
  }, [isLoading, purposes])

  const watchedPurpose = watch('purposeId')

  const purposeOptions: PurposeOption[] = // convert purposes to purposeOptions for React Select
    purposes?.map((purpose) => {
      return {
        value: purpose.purposeId,
        label: purpose.menuDescription,
      }
    }) ?? []
  // TODO: memoize the callback
  const getPurposeOptionByValue = (
    comparisonValue: string,
  ): PurposeOption | undefined => {
    return purposeOptions.find((option) => option.value === comparisonValue)
  }
  const isPurposeChosen = (selectedOption: string): boolean => {
    return !!getPurposeOptionByValue(selectedOption)
  }
  const getSGNotifyTemplateParamsByPurposeId = (
    purposeId: string,
  ): SGNotifyTemplateParams | undefined => {
    if (!purposeId || !purposes) return
    const purpose = purposes.find((purpose) => purpose.purposeId === purposeId)
    return purpose?.sgNotifyTemplateParams
  }

  const submissionHandler = (data: NotificationFormData) => {
    sendNotificationMutation.mutate(data, {
      // only update notif context and send user to feedback form when notification is sent successfully
      onSuccess: () => {
        setTargetNRIC(data.nric)
        setPurposeDescription(getPurposeOptionByValue(data.purposeId)?.label)
        history.push(FEEDBACKFORM_ROUTE)
      },
    })
  }

  const sendNotificationMutation = useMutation(
    NotificationService.sendNotification,
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

  const purposeValidationRules = {
    validate: (v: string) => isPurposeChosen(v) || 'Please select a purpose',
  }

  const onSubmit = handleSubmit(submissionHandler)

  const templateParams = getSGNotifyTemplateParamsByPurposeId(watchedPurpose)

  const clearDetails = () => reset()

  return {
    purposeOptions,
    formMethods,
    onSubmit,
    isLoading,
    purposeValidationRules,
    getPurposeOptionByValue,
    templateParams,
    clearDetails,
    isMutating: sendNotificationMutation.isLoading,
  }
}

export const NotificationForm = (): JSX.Element => {
  const {
    formMethods,
    purposeOptions,
    isLoading,
    purposeValidationRules,
    clearDetails,
    onSubmit,
    getPurposeOptionByValue,
    templateParams,
    isMutating,
  } = useNotificationForm()

  const {
    register,
    formState: { errors },
    control,
    getValues,
  } = formMethods

  return (
    <HeaderContainer>
      <Heading
        fontSize={{ base: 'xl', md: '2xl' }} // suggested by Kar Rui; useful for subsequent refactoring
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
          <form onSubmit={onSubmit}>
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
                <FormErrorMessage>{errors.nric?.message}</FormErrorMessage>
              </FormControl>
              {
                <FormControl isInvalid={!!errors.purposeId}>
                  <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                    Purpose of Call
                  </FormLabel>
                  <Skeleton isLoaded={!isLoading}>
                    <Controller
                      name="purposeId"
                      control={control}
                      rules={purposeValidationRules}
                      render={({
                        field: {
                          onChange: controllerOnChange,
                          value: controllerValue,
                          ...rest
                        },
                      }) => (
                        <Select
                          {...rest}
                          options={purposeOptions}
                          value={getPurposeOptionByValue(controllerValue)}
                          onChange={(option: SingleValue<PurposeOption>) =>
                            controllerOnChange(option?.value)
                          }
                          // TODO: refactor theme somewhere else
                          theme={(theme) => {
                            return {
                              ...theme,
                              colors: {
                                ...theme.colors,
                                primary: '#1B3C87', // ideally should refer back to theme, rather than hardcoding
                              },
                            }
                          }}
                          placeholder="Type to search"
                        />
                      )}
                    />
                  </Skeleton>
                  <FormErrorMessage>
                    {errors.purposeId?.message}
                  </FormErrorMessage>
                </FormControl>
              }
              <StackItem>
                <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                  Message Preview
                </FormLabel>
                <Skeleton isLoaded={!isLoading}>
                  <MessagePreview
                    nric={getValues('nric') ?? ''}
                    selectedPurposePreviewParams={templateParams}
                  />
                </Skeleton>
              </StackItem>
              <StackItem>
                <VStack spacing={[4, 4, 4, 4]}>
                  <Button
                    type="submit"
                    isLoading={isMutating}
                    loadingText="Notifying..."
                    width="100%"
                  >
                    Notify call recipient
                  </Button>
                  <Button
                    width="100%"
                    variant="link"
                    onClick={clearDetails}
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
