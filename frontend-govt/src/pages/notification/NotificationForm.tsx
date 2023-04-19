import React from 'react'
import { useQuery } from 'react-query'
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
import { MessageTemplateDto, MessageTemplateType } from '~shared/types/api'

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
  const { data: messageTemplatesRaw, isLoading } = useQuery(
    ['messageTemplates'], // query key must be in array in React 18
    MessageTemplateService.getMessageTemplates,
  )
  const smsMessageTemplates = messageTemplatesRaw?.filter(
    (template) => template.type === MessageTemplateType.SMS,
  )

  const sgNotifyMessageTemplates = messageTemplatesRaw?.filter(
    (template) => template.type === MessageTemplateType.SGNOTIFY,
  )

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
              <SMSForm
                templates={smsMessageTemplates}
                templatesIsLoading={isLoading}
              />
            </TabPanel>
            <TabPanel>
              <SGNotifyForm
                templates={sgNotifyMessageTemplates}
                templatesIsLoading={isLoading}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </HeaderContainer>
  )
}
