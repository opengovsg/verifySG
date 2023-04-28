import React from 'react'
import { Control, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Box, FormControl, VStack } from '@chakra-ui/react'
import { requiresFeedbackForm } from '@constants/feedback-form-metadata'
import {
  FormErrorMessage,
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
  useToastOptions,
} from '@/pages/notification/NotificationForm'
import {
  NtfFormButtons,
  NtfFormLabel,
  NtfInlineMessage,
  NtfMessagePreview,
  NtfTemplateSelectionMenu,
} from '@/pages/notification/NotificationFormComponents'
import {
  MessageTemplateDto,
  MessageTemplateType,
  SendNotificationReqDto,
  SendNotificationReqSmsDto,
} from '~shared/types/api'
import { DEFAULT_ERROR_MESSAGE } from '~shared/utils'

interface SmsFormProps {
  templates: MessageTemplateDto[] | undefined
  templatesIsLoading: boolean
  onSubmit?: (data: SendNotificationReqSmsDto) => void
}

// todo: overlap with useSGNotifyForm, to abstract one day (blocked by weird typing in react-hook-form)
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

export const SMSForm: React.FC<SmsFormProps> = ({
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
  const templateParams = getParamsByMsgTemplateKey(
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

  const inlineMessage =
    'When you click the ‘Notify call recipient’ button, an SMS will be sent to the phone number specified below with the content previewed below.'

  return (
    <VStack spacing="15px">
      <NtfInlineMessage message={inlineMessage} />
      <Box width="100%">
        <form onSubmit={onSubmit}>
          <VStack align="left" spacing={[8, 8, 8, 8]}>
            <FormControl isInvalid={!!errors.recipientPhoneNumber}>
              <NtfFormLabel label={'Mobile Number'} />
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
              <NtfTemplateSelectionMenu
                templatesIsLoading={templatesIsLoading}
                control={control as Control<SendNotificationReqDto>}
                messageTemplateOptions={messageTemplateOptions}
                getMessageTemplateOptionByValue={(value) =>
                  getMessageTemplateOptionByValue(value, messageTemplateOptions)
                }
              />
            </FormControl>
            <NtfMessagePreview
              templatesIsLoading={templatesIsLoading}
              selectedTemplate={templateParams}
              recipientPhoneNumber={getValues('recipientPhoneNumber') ?? ''}
            />
            <NtfFormButtons clearInputs={clearInputs} isMutating={isMutating} />
          </VStack>
        </form>
      </Box>
    </VStack>
  )
}
