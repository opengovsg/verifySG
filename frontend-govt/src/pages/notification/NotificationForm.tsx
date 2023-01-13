import React, { useEffect } from 'react'
import { Control, Controller } from 'react-hook-form'
import { UseFormSetValue } from 'react-hook-form/dist/types/form'
import { useQuery } from 'react-query'
import Select, { SingleValue } from 'react-select'
import {
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from '@chakra-ui/react'

import HeaderContainer from '@/components/HeaderContainer'
import { SGNotifyForm } from '@/pages/notification/SGNotifyForm'
import { SMSForm } from '@/pages/notification/SMSForm'
import { MessageTemplateService } from '@/services/MessageTemplateService'
import { MessageTemplateDto, SendNotificationReqDto } from '~shared/types/api'

export interface MessageTemplateOption {
  // shape for React Select options
  value: string // msgTemplateKey
  label: string // menu
}

export const useToastOptions = {
  // there is a bug with setting duration in useToast; always defaults to 5 seconds
  // to fix in the future
  isClosable: true,
  containerStyle: {
    width: '680px',
    maxWidth: '100%',
  },
}

export const useDefaultMessageTemplate = (
  setValue: UseFormSetValue<SendNotificationReqDto>,
  messageTemplateType: MessageTemplateDto['type'],
  messageTemplates: MessageTemplateDto[] | undefined,
  isLoading: boolean,
) => {
  // load default value if response only contains a single message template
  const messageTemplateFiltered = messageTemplates?.filter(
    (template) => template.type === messageTemplateType,
  )
  useEffect(() => {
    if (!isLoading && messageTemplateFiltered?.length === 1) {
      setValue('msgTemplateKey', messageTemplateFiltered[0].key)
    }
  }, [isLoading, messageTemplates])
}

export const useMessageTemplates = () => {
  const { data: messageTemplates, isLoading } = useQuery(
    ['messageTemplates'], // query key must be in array in React 18
    MessageTemplateService.getMessageTemplates,
  )

  return {
    messageTemplates,
    isLoading,
  }
}

export const getMessageTemplateOptionByValue = (
  targetValue: string,
  messageTemplateOptions: MessageTemplateOption[],
): MessageTemplateOption | null => {
  const option = messageTemplateOptions.find(
    (option) => option.value === targetValue,
  )
  return option ?? null
}

export const getParamsByMsgTemplateKey = <T,>(
  msgTemplateKey: string,
  messageTemplates: MessageTemplateDto[] | undefined,
): T | undefined => {
  if (!msgTemplateKey || !messageTemplates) return

  const messageTemplate = messageTemplates.find(
    (template) => template.key === msgTemplateKey,
  )
  if (!messageTemplate || !messageTemplate.params) return
  return messageTemplate.params as unknown as T
}

export const NotificationForm: React.FC = () => {
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
        <Tabs isFitted>
          <TabList>
            <Tab>SMS</Tab>
            <Tab>Singpass</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SMSForm />
            </TabPanel>
            <TabPanel>
              <SGNotifyForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </HeaderContainer>
  )
}

interface TemplateSelectionMenuProps {
  control: Control<SendNotificationReqDto>
  messageTemplateOptions: MessageTemplateOption[]
  getMessageTemplateOptionByValue: (
    target: string,
  ) => MessageTemplateOption | null
}

export const TemplateSelectionMenu: React.FC<TemplateSelectionMenuProps> = ({
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
