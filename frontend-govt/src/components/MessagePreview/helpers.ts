import { SGNotifyTemplateParams } from '../../types/purpose'
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
// note similarity with interfaces in message-template.ts on frontend 2/2; TODO refactor into shared types
export interface AgencyParams {
  agencyShortName: string
  agencyName: string
}

export interface OfficerParams {
  officerName: string
  officerPosition: string
}

export type SelectedPurposePreviewParams = SGNotifyTemplateParams // to extend if other modalities supported

export const messageContentFactory = (
  nric: string,
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
  selectedPurpose: SelectedPurposePreviewParams | undefined,
): string => {
  if (!selectedPurpose)
    return '<b>Select purpose of call to see message preview</b>'

  const maskedNric = getMaskedNric(nric.toUpperCase())
  const { templateId, templatePurposeParams } = selectedPurpose
  const { agencyShortName, agencyName } = agencyParams
  const { officerName, officerPosition } = officerParams

  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      // DANGER: be careful about this destructuring; they are template-specific and not typed
      const callDetailsNotifyBeforeCall = templatePurposeParams.call_details
      const callbackDetailsNotifyBeforeCall =
        templatePurposeParams.callback_details || ' '
      return `<b>Title:</b> Upcoming phone call
        <br><br>
        <b>Agency:</b> ${agencyName}
        <br><br>
        Dear Sir/Madam <u><b>(${maskedNric})</b></u>,
        <br><br>
        <u><b>${officerName}, ${officerPosition}</u></b> at <u><b>${agencyShortName}</u></b> will be calling you shortly.
        <br><br>
        ${callDetailsNotifyBeforeCall}
        <br><br>
        ${callbackDetailsNotifyBeforeCall}`
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      // DANGER: be careful about this destructuring; they are template-specific and not typed
      const callDetailsNotifyDuringCall = templatePurposeParams.call_details
      return `<b>Title:</b> Verify your phone call
        <br><br>
        <b>Agency:</b> ${agencyName}
        <br><br>
        Dear Sir/Madam <u><b>(${maskedNric})</b></u>,
        <br><br>
        This message is to verify that you are currently speaking to <u><b>${officerName}, ${officerPosition}</u></b> from <b><u>${agencyShortName}</u></b>.
        <br><br>
        ${callDetailsNotifyDuringCall}`
    default:
      return 'Your agency is not currently supported by CheckWho. Please contact our administrators for support'
  }
}
