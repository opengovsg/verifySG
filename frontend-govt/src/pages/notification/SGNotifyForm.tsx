import React from 'react'
import { Control, useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { Box, FormControl, VStack } from '@chakra-ui/react'
import {
  FormErrorMessage,
  Input,
  useToast,
} from '@opengovsg/design-system-react'
import { NotificationService } from '@services/NotificationService'
import nric from 'nric'

import {
  NtfFormButtons,
  NtfFormLabel,
  NtfInlineMessage,
  NtfMessagePreview,
  NtfTemplateSelectionMenu,
} from './NotificationFormComponents'

import {
  getMessageTemplateOptionByValue,
  getParamsByMsgTemplateKey,
  useToastOptions,
} from '@/pages/notification/NotificationForm'
import {
  MessageTemplateDto,
  MessageTemplateType,
  SendNotificationReqDto,
  SendNotificationReqSGNotifyDto,
  SGNotifyMessageTemplateParams,
} from '~shared/types/api'
import { DEFAULT_ERROR_MESSAGE } from '~shared/utils'

interface SGNotifyFormProps {
  templates: MessageTemplateDto[] | undefined
  templatesIsLoading: boolean
  onSubmit?: (data: SendNotificationReqSGNotifyDto) => void
}

const useSGNotifyForm = () => {
  const formMethods = useForm<SendNotificationReqSGNotifyDto>({
    mode: 'onTouched', // to validate NRIC before submission; default is onSubmit
  })
  const { reset, setValue, watch, handleSubmit } = formMethods
  setValue('type', MessageTemplateType.SGNOTIFY)

  const toast = useToast(useToastOptions)

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
          description: `${err}` || DEFAULT_ERROR_MESSAGE,
          isClosable: false,
        })
      },
    },
  )
  const submissionHandler = (data: SendNotificationReqSGNotifyDto) => {
    sendNotificationMutation.mutate(data, {
      // only update notif context and send user to feedback form when notification is sent successfully
      onSuccess: () => {
        // upon successful notification, reset NRIC but keep selected message template
        setValue('nric', '')
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

export const SGNotifyForm: React.FC<SGNotifyFormProps> = ({
  templates,
  templatesIsLoading,
}) => {
  const {
    onSubmit,
    clearInputs,
    formMethods,
    getMessageTemplateOptionByValue,
    isMutating,
  } = useSGNotifyForm()

  const {
    register,
    formState: { errors },
    control,
    getValues,
    watch,
    setValue,
  } = formMethods

  const watchedMessageTemplate = watch('msgTemplateKey')
  const templateParams =
    getParamsByMsgTemplateKey<SGNotifyMessageTemplateParams>(
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
    'When you click the ‘Notify call recipient’ button, a Singpass push notification will be sent to the NRIC specified with the content previewed below.'

  return (
    <VStack spacing="15px">
      <NtfInlineMessage message={inlineMessage}></NtfInlineMessage>
      <Box width="100%">
        <form onSubmit={onSubmit}>
          <VStack align="left" spacing={[8, 8, 8, 8]}>
            <FormControl isInvalid={!!errors.nric}>
              <NtfFormLabel label={'NRIC / FIN'} />
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
              nric={getValues('nric') ?? ''}
            />
            <NtfFormButtons clearInputs={clearInputs} isMutating={isMutating} />
          </VStack>
        </form>
      </Box>
    </VStack>
  )
}
