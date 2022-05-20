import { useQuery } from 'react-query'
import { Alert, Box } from '@chakra-ui/react'

import { OfficerService } from '../../services/OfficerService'

import { messageContentFactory } from './helpers'

const MessagePreview: React.FC<{ nric: string }> = ({ nric }) => {
  // query hooks to retrieve and mutate data
  const { data: profile } = useQuery('profile', OfficerService.getOfficer)

  const name = profile?.name ?? '<NO PROFILE NAME ENTERED>'
  const position = profile?.position ?? '<NO POSITION ENTERED>'
  const agency = profile?.agency.id ?? '<NO AGENCY ENTERED>'

  const messageContent = messageContentFactory({
    nric,
    name,
    position,
    agency,
  })

  return (
    <Alert colorScheme={'gray'}>
      <Box dangerouslySetInnerHTML={messageContent} />
    </Alert>
  )
}

export default MessagePreview
