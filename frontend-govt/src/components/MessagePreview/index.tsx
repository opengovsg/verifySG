import { useQuery } from 'react-query'
import { Alert, Box, VStack } from '@chakra-ui/react'

import { OfficerService } from '../../services/OfficerService'
import { maskNric } from '../../utils/nric'

const SpfMessage: React.FC<{
  rawName: string
  nric: string
  rawAgency: string
  rawPosition: string
}> = ({ rawName, nric, rawPosition, rawAgency }) => {
  const name = rawName ?? '<NO PROFILE NAME ENTERED>'
  const position = rawPosition ?? '<NO POSITION ENTERED>'
  const agency = rawAgency ?? '<NO AGENCY ENTERED>'

  const getMaskedNric = (nric: string) => {
    if (nric === '') {
      return 'PLEASE ENTER NRIC'
    }
    try {
      return maskNric(nric)
    } catch (e) {
      return 'PLEASE ENTER VALID NRIC'
    }
  }

  return (
    <Box>
      Dear Sir/Madam{' '}
      <u style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
        ({getMaskedNric(nric)})
      </u>
      , This is to verify that you are currently speaking to{' '}
      <u style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
        {name}, {position}
      </u>{' '}
      from the{' '}
      <u style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{agency}</u>
    </Box>
  )
}

const MessagePreview: React.FC<{ nric: string }> = ({ nric }) => {
  // query hooks to retrieve and mutate data
  const { data: profile } = useQuery('profile', OfficerService.getOfficer)

  return (
    <Alert colorScheme={'gray'}>
      <SpfMessage
        rawName={profile?.name ?? ''}
        rawAgency={profile?.agency.name ?? ''}
        nric={nric}
        rawPosition={profile?.position ?? ''}
      />
    </Alert>
  )
}

export default MessagePreview
