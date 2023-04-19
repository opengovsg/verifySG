import React from 'react'
import { Control, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Box, FormControl, Skeleton, StackItem, VStack } from '@chakra-ui/react'
import MessagePreview from '@components/MessagePreview'
import { requiresFeedbackForm } from '@constants/feedback-form-metadata'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  InlineMessage,
  Input,
  useToast,
} from '@opengovsg/design-system-react'
import { NotificationService } from '@services/NotificationService'

import { FEEDBACKFORM_ROUTE } from '@/constants/routes'
import { useAuth } from '@/contexts/auth/AuthContext'
import { useNotificationData } from '@/contexts/notification/NotificationDataContext'
import {
  getMessageTemplateOptionByValue,
  getParamsByMsgTemplateKey,
  TemplateSelectionMenu,
  useToastOptions,
} from '@/pages/notification/NotificationForm'
import {
  MessageTemplateDto,
  MessageTemplateType,
  SendNotificationReqDto,
  SendNotificationReqSmsDto,
  SmsMessageTemplateParams,
} from '~shared/types/api'
import { DEFAULT_ERROR_MESSAGE } from '~shared/utils'

interface SGNotifyFormProps {
  templates: MessageTemplateDto[] | undefined
  templatesIsLoading: boolean
  onSubmit?: (data: SendNotificationReqSmsDto) => void
}

const useSmsForm = () => {
  const formMethods = useForm<SendNotificationReqSmsDto>({
    mode: 'onTouched', // to validate phone number before submission
  })
  const { watch, reset, setValue, handleSubmit } = formMethods
  setValue('type', MessageTemplateType.SMS)

  const toast = useToast(useToastOptions)
  const history = useHistory()
  const { officerAgency } = useAuth()
  const { setTargetPhoneNumber, setMsgTemplateKey } = useNotificationData()

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
        if (requiresFeedbackForm(officerAgency, data.msgTemplateKey)) {
          setTargetPhoneNumber(data.recipientPhoneNumber)
          setMsgTemplateKey(data.msgTemplateKey)
          history.push(FEEDBACKFORM_ROUTE)
        }
      },
    })
  }

  const onSubmit = handleSubmit(submissionHandler)

  const clearInputs = () => reset()

  return {
    onSubmit,
    clearInputs,
    formMethods,
    getMessageTemplateOptionByValue,
    isMutating: sendNotificationMutation.isLoading,
  }
}

export const SMSForm: React.FC<SGNotifyFormProps> = ({
  templates,
  templatesIsLoading,
}) => {
  const {
    onSubmit,
    clearInputs,
    formMethods,
    getMessageTemplateOptionByValue,
    isMutating,
  } = useSmsForm()

  const {
    register,
    formState: { errors },
    control,
    getValues,
    watch,
    setValue,
  } = formMethods

  const watchedMessageTemplate = watch('msgTemplateKey')
  const templateParams = getParamsByMsgTemplateKey<SmsMessageTemplateParams>(
    watchedMessageTemplate,
    templates,
  )
  const messageTemplateOptions =
    templates?.map((template) => {
      return {
        value: template.key,
        label: template.menu,
      }
    }) ?? []

  if (
    getValues('msgTemplateKey') === undefined &&
    messageTemplateOptions.length === 1
  ) {
    setValue('msgTemplateKey', messageTemplateOptions[0].value)
  }

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
              <Skeleton isLoaded={!templatesIsLoading}>
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
              <Skeleton isLoaded={!templatesIsLoading}>
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
