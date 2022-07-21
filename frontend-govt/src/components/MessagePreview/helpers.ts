import { maskNric } from '~shared/utils/nric'
import {
  generateCallDetails,
  salutations,
  SGNotifyMessageTemplateId,
  standardOpening,
} from '~shared/utils/sgnotify'

export const getMaskedNric = (nric: string) => {
  if (nric === '') {
    return 'PLEASE ENTER NRIC / FIN'
  }
  try {
    return maskNric(nric)
  } catch (e) {
    return 'PLEASE ENTER VALID NRIC / FIN'
  }
}

/**
 * Generates message content based on different agencies. If agency is not supported, will default to unsupported message.
 *
 * List of supported agencies as of 19 May 2022:
 * - OGP
 * - SPF
 */
export const messageContentFactory = ({
  nric,
  name,
  agency,
  position,
}: {
  nric: string
  name: string
  agency: string
  position: string
}): string => {
  const maskedNric = getMaskedNric(nric)

  switch (agency) {
    // TODO: move SPF away from during call notification
    case 'SPF':
      return `${salutations(maskedNric)} 
        <br/><br/>
        ${standardOpening(
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
          name,
          position,
          agency,
        )}
        <br/><br/>
        ${generateCallDetails(
          agency,
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
        )}`

    case 'OGP':
    case 'MSF':
    case 'ECDA':
      return `${salutations(maskedNric)} 
        <br/><br/>
        ${standardOpening(
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
          name,
          position,
          agency,
        )}
        <br/><br/>
        ${generateCallDetails(
          agency,
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
        )}`
    default:
      return 'Your agency is not currently supported by CheckWho. Please contact our administrators for support'
  }
}
