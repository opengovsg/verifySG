import React from 'react'
import { useQuery } from 'react-query'
import { Alert, Box } from '@chakra-ui/react'
import { OfficerService } from '@services/OfficerService'
import sanitizeHtml from 'sanitize-html'

import { messageContentFactory, SelectedTemplatePreviewParams } from './helpers'

interface MessagePreviewProps {
  nric: string
  selectedTemplate: SelectedTemplatePreviewParams | undefined
}

export const MessagePreview: React.FC<MessagePreviewProps> = ({
  nric,
  selectedTemplate,
}) => {
  // query hooks to retrieve and mutate data
  const { data: profile } = useQuery(['profile'], OfficerService.getOfficer)

  const officerName = profile?.name ?? '<NO PROFILE NAME ENTERED>'
  const officerPosition = profile?.position ?? '<NO POSITION ENTERED>'
  const agencyShortName = profile?.agency.id ?? '<NO AGENCY ENTERED>'
  const agencyName = profile?.agency.name ?? '<NO AGENCY ENTERED>'

  const messageContent = messageContentFactory(
    nric,
    {
      agencyShortName,
      agencyName,
    },
    {
      officerName,
      officerPosition,
    },
    selectedTemplate,
  )

  return (
    <Alert colorScheme={'primary.200'}>
      <Box
        fontSize={['sm', 'sm', 'md', 'md']}
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(messageContent, {
            allowedTags: ['b', 'u', 'br'],
            allowedAttributes: {},
          }),
        }}
      />
    </Alert>
  )
}
