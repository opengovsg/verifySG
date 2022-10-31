import React, { useEffect } from 'react'
import { Control, Controller, useForm } from 'react-hook-form'
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
import { requiresFeedbackForm } from '@constants/feedback-form-metadata'
import { FEEDBACKFORM_ROUTE } from '@constants/routes'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  InlineMessage,
  Input,
  useToast,
} from '@opengovsg/design-system-react'
import { NotificationService } from '@services/NotificationService'
import nric from 'nric'

import HeaderContainer from '@/components/HeaderContainer'
import MessagePreview from '@/components/MessagePreview'
import { useAuth } from '@/contexts/auth/AuthContext'
import { useNotificationData } from '@/contexts/notification/NotificationDataContext'
import { MessageTemplateService } from '@/services/MessageTemplateService'
import { SGNotifyMessageTemplateParams } from '~shared/types/api'

interface NotificationFormData {
  nric: string
  msgTemplateKey: string
}

interface NotificationFormProps {
  onSubmit?: (data: NotificationFormData) => void
}

interface MessageTemplateOption {
  // shape for React Select options
  value: string // msgTemplateKey
  label: string // menu
}

const useNotificationForm = () => {
  const formMethods = useForm<NotificationFormData>({
    mode: 'onTouched', // to validate NRIC before submission; default is onSubmit
  })
  const { watch, reset, setValue, handleSubmit } = formMethods

  const { setTargetNRIC, setMsgTemplateKey } = useNotificationData()

  const toast = useToast({
    isClosable: true,
    containerStyle: {
      width: '680px',
      maxWidth: '100%',
    },
    duration: 6000,
  })
  const history = useHistory()
  const { officerAgency } = useAuth()

  const { data: messageTemplates, isLoading } = useQuery(
    ['messageTemplates'], // query key must be in array in React 18
    MessageTemplateService.getMessageTemplates,
  )

  // load default value if response only contains a single purpose
  useEffect(() => {
    if (!isLoading && messageTemplates?.length === 1) {
      // load default value on query load
      setValue('msgTemplateKey', messageTemplates[0].key)
    }
  }, [isLoading, messageTemplates, setValue])

  const watchedMessageTemplate = watch('msgTemplateKey')

  const messageTemplateOptions: MessageTemplateOption[] =
    messageTemplates?.map((messageTemplate) => {
      return {
        value: messageTemplate.key,
        label: messageTemplate.menu,
      }
    }) ?? []

  const getMessageTemplateOptionByValue = (
    targetValue: string,
  ): MessageTemplateOption | null => {
    const option = messageTemplateOptions.find(
      (option) => option.value === targetValue,
    )
    return option ?? null
  }

  const getSGNotifyMessageTemplateParamsByMsgTemplateKey = (
    msgTemplateKey: string,
  ): SGNotifyMessageTemplateParams | undefined => {
    if (!msgTemplateKey || !messageTemplates) return

    const messageTemplate = messageTemplates.find(
      (template) => template.key === msgTemplateKey,
    )
    if (!messageTemplate || !messageTemplate.sgNotifyMessageTemplateParams)
      return
    return messageTemplate.sgNotifyMessageTemplateParams
  }

  // query hook to mutate data
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
  const submissionHandler = (data: NotificationFormData) => {
    sendNotificationMutation.mutate(data, {
      // only update notif context and send user to feedback form when notification is sent successfully
      onSuccess: () => {
        if (requiresFeedbackForm(officerAgency)) {
          setTargetNRIC(data.nric)
          setMsgTemplateKey(data.msgTemplateKey)
          history.push(FEEDBACKFORM_ROUTE)
          return
        }
        // upon successful notification, reset NRIC but keep selected message template
        setValue('nric', '')
      },
    })
  }

  const onSubmit = handleSubmit(submissionHandler)

  const templateParams = getSGNotifyMessageTemplateParamsByMsgTemplateKey(
    watchedMessageTemplate,
  )

  const clearInputs = () => reset()

  return {
    onSubmit,
    clearInputs,
    templateParams,
    formMethods,
    messageTemplateOptions,
    isLoading,
    getMessageTemplateOptionByValue,
    isMutating: sendNotificationMutation.isLoading,
  }
}

export const NotificationForm: React.FC<NotificationFormProps> = () => {
  const {
    onSubmit,
    clearInputs,
    templateParams,
    formMethods,
    messageTemplateOptions,
    isLoading,
    getMessageTemplateOptionByValue,
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
              <FormControl isInvalid={!!errors.msgTemplateKey}>
                <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                  Message Template
                </FormLabel>
                <Skeleton isLoaded={!isLoading}>
                  <TemplateSelectionMenu
                    control={control}
                    messageTemplateOptions={messageTemplateOptions}
                    getMessageTemplateOptionByValue={
                      getMessageTemplateOptionByValue
                    }
                  />
                </Skeleton>
              </FormControl>
              <StackItem>
                <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                  Message Preview
                </FormLabel>
                <Skeleton isLoaded={!isLoading}>
                  <MessagePreview
                    nric={getValues('nric') ?? ''}
                    selectedTemplate={templateParams}
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
                    onClick={clearInputs}
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

interface TemplateSelectionMenuProps {
  control: Control<NotificationFormData>
  messageTemplateOptions: MessageTemplateOption[]
  getMessageTemplateOptionByValue: (
    target: string,
  ) => MessageTemplateOption | null
}

const TemplateSelectionMenu: React.FC<TemplateSelectionMenuProps> = ({
  control,
  messageTemplateOptions,
  getMessageTemplateOptionByValue,
}) => {
  return (
    <Controller
      name="msgTemplateKey"
      control={control}
      render={({
        field: {
          onChange: controllerOnChange,
          value: controllerValue,
          ...rest
        },
      }) => (
        <Select
          {...rest}
          options={messageTemplateOptions}
          value={getMessageTemplateOptionByValue(controllerValue)}
          onChange={(option: SingleValue<MessageTemplateOption>) =>
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
  )
}
