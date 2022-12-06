import {
  MessageTemplateType,
  SGNotifyMessageTemplateParams,
  SmsMessageTemplateParams,
} from '~shared/types/api'
import { maskNric } from '~shared/utils/nric'
import {
  generateCallDetails,
  salutations,
  sgNotifyTitle,
  standardOpening,
} from '~shared/utils/sgnotify'

export interface AgencyParams {
  agencyShortName: string
  agencyName: string
}

export interface OfficerParams {
  officerName: string
  officerPosition: string
}

export type SelectedTemplatePreviewParams =
  | SGNotifyMessageTemplateParams
  | SmsMessageTemplateParams

// thought about it and decided recipientPhoneNumber is not needed in the preview
// doesn't serve any purpose; if forwarded, can be easily changed
// but still passed in here to do error checking
export const messageContentFactory = (
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
  selectedTemplate: SelectedTemplatePreviewParams | undefined,
  nric?: string,
  recipientPhoneNumber?: string,
): string => {
  if (!selectedTemplate)
    return '<b>Select a template to see message preview</b>'

  switch (selectedTemplate.type) {
    case MessageTemplateType.SGNOTIFY:
      if (nric === undefined) {
        throw new Error('NRIC is required for SGNotify message')
      }
      return generateSGNotifyMessagePreview(
        nric,
        agencyParams,
        officerParams,
        selectedTemplate,
      )
    case MessageTemplateType.SMS:
      if (recipientPhoneNumber === undefined) {
        throw new Error('Phone number is required for SMS message')
      }
      return generateSmsMessagePreview(
        agencyParams,
        officerParams,
        selectedTemplate,
      )
  }
}

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

// TODO: think about how to more closely replicate actual message
// e.g. show the agency logo?
const generateSGNotifyMessagePreview = (
  nric: string,
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
  selectedTemplate: SGNotifyMessageTemplateParams,
) => {
  const { agencyName } = agencyParams
  const { officerName, officerPosition } = officerParams
  const { templateId, longMessageParams } = selectedTemplate

  return `<b><u>${sgNotifyTitle(templateId)}</u></b>
  <br><br>
  ${salutations(getMaskedNric(nric))}
  <br><br>
  ${standardOpening(templateId, officerName, officerPosition, agencyName)}
  <br><br>
  ${generateCallDetails(templateId, longMessageParams)}`
}

const generateSmsMessagePreview = (
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
  selectedTemplate: SmsMessageTemplateParams,
) => {
  const { agencyName } = agencyParams
  const { officerName, officerPosition } = officerParams
  const { message } = selectedTemplate
  return message
    .replaceAll('\n', '<br>')
    .replace('{{officerName}}', officerName)
    .replace('{{officerPosition}}', officerPosition)
    .replace('{{agencyName}}', agencyName)
    .replace('{{uniqueUrl}}', '<b><u>unique-GoGovSG-link</u></b>')
}
