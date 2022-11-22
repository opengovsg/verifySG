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
import nric from 'nric'

import {
  getMessageTemplateOptionByValue,
  getParamsByMsgTemplateKey,
  MessageTemplateOption,
  TemplateSelectionMenu,
  useMessageTemplates,
  useToastOptions,
} from '@/pages/notification/NotificationForm'
import {
  MessageTemplateType,
  SendNotificationReqDto,
  SendNotificationReqSGNotifyDto,
  SGNotifyMessageTemplateParams,
} from '~shared/types/api'

interface SGNotifyFormProps {
  onSubmit?: (data: SendNotificationReqSGNotifyDto) => void
}

const useSGNotifyForm = () => {
  const formMethods = useForm<SendNotificationReqSGNotifyDto>({
    mode: 'onTouched', // to validate NRIC before submission; default is onSubmit
  })
  const { watch, reset, setValue, handleSubmit } = formMethods
  setValue('type', MessageTemplateType.SGNOTIFY)

  const toast = useToast(useToastOptions)

  const { messageTemplates, isLoading } = useMessageTemplates(
    // this is ok as SendNotificationReqSGNotifyDto is a subset of SendNotificationReqDto
    setValue as UseFormSetValue<SendNotificationReqDto>,
  )

  const watchedMessageTemplate = watch('msgTemplateKey')

  const sgNotifyMessageTemplateOptions: MessageTemplateOption[] =
    messageTemplates
      ?.filter((template) => {
        return template.type === MessageTemplateType.SGNOTIFY
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
          description: `Notification sent to ${watch('nric')}`,
        })
      },
      onError: (err) => {
        toast({
          status: 'warning',
          description: `${err}` || 'Something went wrong',
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

  const templateParams =
    getParamsByMsgTemplateKey<SGNotifyMessageTemplateParams>(
      watchedMessageTemplate,
      messageTemplates,
    )

  const clearInputs = () => reset()

  return {
    onSubmit,
    clearInputs,
    templateParams,
    formMethods,
    messageTemplateOptions: sgNotifyMessageTemplateOptions,
    isLoading,
    getMessageTemplateOptionByValue,
    isMutating: sendNotificationMutation.isLoading,
  }
}

export const SGNotifyForm: React.FC<SGNotifyFormProps> = () => {
  const {
    onSubmit,
    clearInputs,
    templateParams,
    formMethods,
    messageTemplateOptions,
    isLoading,
    getMessageTemplateOptionByValue,
    isMutating,
  } = useSGNotifyForm()

  const {
    register,
    formState: { errors },
    control,
    getValues,
  } = formMethods

  return (
    <>
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
        notification will also show your name, your position, and the purpose of
        your call.
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
    </>
  )
}
