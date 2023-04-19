import React from 'react'
import { Control, Controller } from 'react-hook-form'
import Select, { SingleValue } from 'react-select'
import { Skeleton, StackItem, VStack } from '@chakra-ui/react'
import MessagePreview from '@components/MessagePreview'
import { MessagePreviewProps } from '@components/MessagePreview/MessagePreview'
import {
  Button,
  FormLabel,
  InlineMessage,
} from '@opengovsg/design-system-react'

import { MessageTemplateOption } from '@/pages/notification/NotificationForm'
import { SendNotificationReqDto } from '~shared/types/api'

interface NtfInlineMessageProps {
  message: string
}
export const NtfInlineMessage: React.FC<NtfInlineMessageProps> = ({
  message,
}: NtfInlineMessageProps) => {
  return (
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
      {message}
    </InlineMessage>
  )
}

interface NtfFormButtonsProps {
  isMutating: boolean
  clearInputs: () => void
}
export const NtfFormButtons: React.FC<NtfFormButtonsProps> = ({
  isMutating,
  clearInputs,
}: NtfFormButtonsProps) => {
  return (
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
        <Button width="100%" variant="link" onClick={clearInputs} type="reset">
          Clear details
        </Button>
      </VStack>
    </StackItem>
  )
}

interface NtfFormLabelProps {
  label: string
}
export const NtfFormLabel: React.FC<NtfFormLabelProps> = ({
  label,
}: NtfFormLabelProps) => {
  return (
    <FormLabel isRequired fontSize={['md', 'md', 'lg', 'lg']}>
      {label}
    </FormLabel>
  )
}

interface NtfTemplateSelectionMenuProps {
  control: Control<SendNotificationReqDto>
  templatesIsLoading: boolean
  messageTemplateOptions: MessageTemplateOption[]
  getMessageTemplateOptionByValue: (
    target: string,
  ) => MessageTemplateOption | null
}

export const NtfTemplateSelectionMenu: React.FC<
  NtfTemplateSelectionMenuProps
> = ({
  control,
  templatesIsLoading,
  messageTemplateOptions,
  getMessageTemplateOptionByValue,
}) => {
  return (
    <>
      <NtfFormLabel label="Message Template" />
      <Skeleton isLoaded={!templatesIsLoading}>
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
      </Skeleton>
    </>
  )
}

interface NtfMessagePreviewProps extends MessagePreviewProps {
  templatesIsLoading: boolean
}
export const NtfMessagePreview: React.FC<NtfMessagePreviewProps> = ({
  templatesIsLoading,
  selectedTemplate,
  nric,
  recipientPhoneNumber,
}): JSX.Element => {
  return (
    <StackItem>
      <NtfFormLabel label="Message Preview" />
      <Skeleton isLoaded={!templatesIsLoading}>
        <MessagePreview
          recipientPhoneNumber={recipientPhoneNumber}
          nric={nric}
          selectedTemplate={selectedTemplate}
        />
      </Skeleton>
    </StackItem>
  )
}
