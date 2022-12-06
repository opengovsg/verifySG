import React from 'react'
import { Control, useForm } from 'react-hook-form'
import { UseFormSetValue } from 'react-hook-form/dist/types/form'
import { useMutation } from 'react-query'
import { Box, FormControl, Skeleton, StackItem, VStack } from '@chakra-ui/react'
import MessagePreview from '@components/MessagePreview'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  InlineMessage,
  Input,
  useToast,
} from '@opengovsg/design-system-react'
import { NotificationService } from '@services/NotificationService'

import {
  getMessageTemplateOptionByValue,
  getParamsByMsgTemplateKey,
  MessageTemplateOption,
  TemplateSelectionMenu,
  useDefaultMessageTemplate,
  useMessageTemplates,
  useToastOptions,
} from '@/pages/notification/NotificationForm'
import {
  MessageTemplateType,
  SendNotificationReqDto,
  SendNotificationReqSmsDto,
  SmsMessageTemplateParams,
} from '~shared/types/api'
import { DEFAULT_ERROR_MESSAGE } from '~shared/utils'

interface SGNotifyFormProps {
  onSubmit?: (data: SendNotificationReqSmsDto) => void
}

const useSmsForm = () => {
  const formMethods = useForm<SendNotificationReqSmsDto>({
    mode: 'onTouched', // to validate phone number before submission
  })
  const { watch, reset, setValue, handleSubmit } = formMethods
  setValue('type', MessageTemplateType.SMS)

  const toast = useToast(useToastOptions)

  const { messageTemplates, isLoading } = useMessageTemplates()
  useDefaultMessageTemplate(
    setValue as UseFormSetValue<SendNotificationReqDto>,
    MessageTemplateType.SMS,
    messageTemplates,
    isLoading,
  )
  const watchedMessageTemplate = watch('msgTemplateKey')

  const smsMessageTemplateOptions: MessageTemplateOption[] =
    messageTemplates
      ?.filter((template) => {
        return template.type === MessageTemplateType.SMS
      })
      .map((messageTemplate) => {
        return {
          value: messageTemplate.key,
          label: messageTemplate.menu,
        }
      }) ?? []

  // query hook to mutate data
  const sendNotificationMutation = useMutation(
    NotificationService.sendNotification,
    {
      onSuccess: () => {
        toast({
          status: 'success',
          description: `Notification sent to ${watch('recipientPhoneNumber')}`,
        })
      },
      onError: (err) => {
        toast({
          status: 'warning',
          description: `${err}` || DEFAULT_ERROR_MESSAGE,
          isClosable: false,
        })
      },
    },
  )
  const submissionHandler = (data: SendNotificationReqSmsDto) => {
    sendNotificationMutation.mutate(data, {
      // only update notif context and send user to feedback form when notification is sent successfully
      onSuccess: () => {
        // upon successful notification, reset phone number but keep selected message template
        setValue('recipientPhoneNumber', '')
      },
    })
  }

  const onSubmit = handleSubmit(submissionHandler)

  const templateParams = getParamsByMsgTemplateKey<SmsMessageTemplateParams>(
    watchedMessageTemplate,
    messageTemplates,
  )

  const clearInputs = () => reset()

  return {
    onSubmit,
    clearInputs,
    templateParams,
    formMethods,
    messageTemplateOptions: smsMessageTemplateOptions,
    isLoading,
    getMessageTemplateOptionByValue,
    isMutating: sendNotificationMutation.isLoading,
  }
}

export const SMSForm: React.FC<SGNotifyFormProps> = () => {
  const {
    onSubmit,
    clearInputs,
    templateParams,
    formMethods,
    messageTemplateOptions,
    isLoading,
    getMessageTemplateOptionByValue,
    isMutating,
  } = useSmsForm()

  const {
    register,
    formState: { errors },
    control,
    getValues,
  } = formMethods

  return (
    <VStack spacing="15px">
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
        When you click the ‘Notify call recipient’ button, an SMS will be sent
        to the phone number specified below with the content previewed below.
      </InlineMessage>
      <Box width="100%">
        <form onSubmit={onSubmit}>
          <VStack align="left" spacing={[8, 8, 8, 8]}>
            <FormControl isInvalid={!!errors.recipientPhoneNumber}>
              <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                Mobile Number
              </FormLabel>
              <Input
                {...register('recipientPhoneNumber', {
                  required: 'Please enter a valid mobile number',
                  validate: {
                    valid: (v) =>
                      (/^\d{8}$/.test(v) && /^[89]/.test(v)) ||
                      'Please enter a valid mobile number',
                  },
                })}
                placeholder="e.g. 81234567"
                autoFocus
              />
              <FormErrorMessage>
                {errors.recipientPhoneNumber?.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errors.msgTemplateKey}>
              <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
                Message Template
              </FormLabel>
              <Skeleton isLoaded={!isLoading}>
                <TemplateSelectionMenu
                  control={control as Control<SendNotificationReqDto>}
                  messageTemplateOptions={messageTemplateOptions}
                  getMessageTemplateOptionByValue={(value) =>
                    getMessageTemplateOptionByValue(
                      value,
                      messageTemplateOptions,
                    )
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
                  recipientPhoneNumber={getValues('recipientPhoneNumber') ?? ''}
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
  )
}
