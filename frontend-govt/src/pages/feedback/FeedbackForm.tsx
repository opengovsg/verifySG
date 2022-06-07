import { useState } from 'react'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Link, Text, VStack } from '@chakra-ui/react'
import { Button } from '@opengovsg/design-system-react'

import HeaderContainer from '../../components/HeaderContainer'
import { NOTIFICATIONFORM_ROUTE } from '../../constants/routes'
import { useNotificationData } from '../../contexts/notification/NotificationDataProvider'
import { OfficerService } from '../../services/OfficerService'

interface FormFieldPrefill {
  fieldId: string
  value?: string
}

export const FeedbackForm: React.FC = () => {
  const formLink = 'https://form.gov.sg/627a0dbe5fba010011ff832c'
  const nameFieldId = '623d285ee46e5c0012d70649'
  const positionFieldId = '623d286e012667001232b83f'
  const nricFieldId = '623d31820126670012345b40'
  const purposeFieldId = '' // TODO

  const [embedLink, setEmbedLink] = useState<string | undefined>()
  const {
    targetNRIC,
    setTargetNRIC,
    purposeDescription,
    setPurposeDescription,
  } = useNotificationData()
  const history = useHistory()

  const getPrefillLink = (ogLink: string, prefills: FormFieldPrefill[]) =>
    ogLink +
    prefills
      // filter out all prefills with undefined values
      .filter(({ value }) => value !== undefined)
      // map each prefill to their URL query string representation
      .map(({ fieldId, value }, index) =>
        // first prefill should provide the ? separator, subseq. fields should provide the & separator
        index === 0
          ? `?${fieldId}=${encodeURIComponent(value || '')}`
          : `&${fieldId}=${encodeURIComponent(value || '')}`,
      )
      // concat all query strings together to be added to the original form link
      .join('')

  useQuery('profile', OfficerService.getOfficer, {
    onSuccess: ({ name, position }) => {
      const prefills: FormFieldPrefill[] = [
        {
          fieldId: nameFieldId,
          value: name,
        },
        {
          fieldId: positionFieldId,
          value: position,
        },
        {
          fieldId: nricFieldId,
          value: targetNRIC,
        },
        {
          fieldId: purposeFieldId,
          value: purposeDescription,
        },
      ]
      setEmbedLink(getPrefillLink(formLink, prefills))
    },
  })

  const returnToNotificationForm = () => {
    // clear nric in notificationDataContext
    setTargetNRIC(undefined)
    setPurposeDescription(undefined)

    // redirect to notification form
    history.push(NOTIFICATIONFORM_ROUTE)
  }

  return (
    <HeaderContainer>
      <VStack spacing="48px" mt="32px">
        <VStack>
          <Text>
            If the form below is not loaded, you can also fill it in{' '}
            <Link isExternal href={embedLink}>
              here
            </Link>
          </Text>
          <iframe height="608px" width="912px" src={embedLink} />
          {/*<embed height="608px" width="912px" src={embedLink} />*/}
        </VStack>
        <Button size="auto" onClick={returnToNotificationForm}>
          Send another notification
        </Button>
      </VStack>
    </HeaderContainer>
  )
}
