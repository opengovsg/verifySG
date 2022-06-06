import { maskNric } from '../../utils/nric'

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

// TODO: refactor into shared folders SGNotifyMessageTemplateId 1/2
export enum SGNotifyMessageTemplateId {
  GENERIC_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-01',
  GENERIC_NOTIFICATION_DURING_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-02',
  SPF_POLICE_REPORT_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-01',
  GOVTECH_FEEDBACK_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GT-01',
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
  const maskedNric = getMaskedNric(nric.toUpperCase())

  switch (agency.toLowerCase()) {
    case 'spf':
      return `Dear Sir/Madam <u><b>(${maskedNric})</b></u>,
        <br/>
        <br/>
        This message is to verify that you are currently speaking to <u><b>${name}, ${position}</u></b> from <b><u>${agency.toUpperCase()}</u></b>.
        <br/>
        <br/>
        The purpose of this call is to follow up on your recent police report/feedback to the Police.`

    case 'ogp':
      return `Dear Sir/Madam <u><b>(${maskedNric})</b></u>,
        <br/>
        <br/>
        <u><b>${name}, ${position}</u></b> at <u><b>${agency}</u></b> will be calling you shortly.
        <br/>
        <br/>
        Thank you for agreeing to provide feedback on our products and services. The purpose of the call is to conduct a short feedback interview.
        <br/>
        <br/>
        This call will be made in the next 10 minutes. You may verify the caller's identity by asking for their name and designation, ensuring that it matches the information provided in this message.`
    default:
      return 'Your agency is not currently supported by CheckWho. Please contact our administrators for support'
  }
}
