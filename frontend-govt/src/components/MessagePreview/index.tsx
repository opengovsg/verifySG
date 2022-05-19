import { useQuery } from 'react-query'
import { Alert, Box } from '@chakra-ui/react'

import { OfficerService } from '../../services/OfficerService'

import { messageContentFactory } from './helpers'
import { MessageContent } from './messagePreview.types'

const MessageBlock: React.FC<MessageContent> = ({
  type,
  isLineBreak,
  content,
}) => {
  if (type === 'parameter') {
    return (
      <>
        <u style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
          {content}
        </u>{' '}
        {isLineBreak && (
          <>
            <br />
            <br />
          </>
        )}
      </>
    )
  }
  return (
    <>
      {content}{' '}
      {isLineBreak && (
        <>
          <br />
          <br />
        </>
      )}{' '}
    </>
  )
}

const MessagePreview: React.FC<{ nric: string }> = ({ nric }) => {
  // query hooks to retrieve and mutate data
  const { data: profile } = useQuery('profile', OfficerService.getOfficer)

  const name = profile?.name ?? '<NO PROFILE NAME ENTERED>'
  const position = profile?.position ?? '<NO POSITION ENTERED>'
  const agency = profile?.agency.name ?? '<NO AGENCY ENTERED>'

  const notSupportedMessage =
    'Your agency is not currently supported by Checkwho! Please contact our administrators for support'

  const messageContent = messageContentFactory({
    nric,
    name,
    position,
    agency,
  })

  return (
    <Alert colorScheme={'gray'}>
      <Box>
        {messageContent
          ? messageContent?.map(({ isLineBreak, type, content }) => {
              return (
                <MessageBlock
                  isLineBreak={isLineBreak}
                  type={type}
                  content={content}
                />
              )
            })
          : notSupportedMessage}
      </Box>
    </Alert>
  )
}

export default MessagePreview
