import { SGNotifyMessageTemplateParams } from '~shared/types/api'
import { maskNric } from '~shared/utils/nric'
import {
  generateCallDetails,
  salutations,
  sgNotifyTitle,
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

export interface AgencyParams {
  agencyShortName: string
  agencyName: string
}

export interface OfficerParams {
  officerName: string
  officerPosition: string
}

export type SelectedTemplatePreviewParams = SGNotifyMessageTemplateParams // to extend if other modalities supported

// TODO: think about how to more closely replicate actual message
// e.g. show the agency logo?
export const messageContentFactory = (
  nric: string,
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
  selectedTemplate: SelectedTemplatePreviewParams | undefined,
): string => {
  if (!selectedTemplate)
    return '<b>Select a template to see message preview</b>'

  const maskedNric = getMaskedNric(nric)
  const { agencyName } = agencyParams
  const { officerName, officerPosition } = officerParams
  const { templateId, longMessageParams } = selectedTemplate

  return `<b><u>${sgNotifyTitle(templateId)}</u></b>
  <br><br>
  ${salutations(maskedNric)}
  <br><br>
  ${standardOpening(templateId, officerName, officerPosition, agencyName)}
  <br><br>
  ${generateCallDetails(templateId, longMessageParams)}`
}
