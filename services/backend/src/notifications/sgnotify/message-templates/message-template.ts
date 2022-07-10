import { JWTPayload } from 'jose'

import {
  NotificationStatus,
  SGNotifyNotificationStatus,
} from '../../../database/entities'
import { maskNric } from '../utils'

export interface SGNotifyParams {
  agencyLogoUrl: string
  agencyName: string
  title: string
  nric: string
  shortMessage: string
  templateId: SGNotifyMessageTemplateId
  sgNotifyLongMessageParams: Record<string, string>
  status: SGNotifyNotificationStatus
  requestId?: string
}

export enum SGNotifyMessageTemplateId {
  GENERIC_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-01',
  GENERIC_NOTIFICATION_DURING_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-02',
  SPF_POLICE_REPORT_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-01',
  GOVTECH_FEEDBACK_NOTIFICATION_BEFORE_PHONE_CALL = 'GOVTECH-CHECKWHO-GT-01',
}

export const sgNotifyParamsStatusToNotificationStatusMapper = (
  params: SGNotifyParams,
): NotificationStatus => {
  return params.status === SGNotifyNotificationStatus.NOT_SENT
    ? NotificationStatus.NOT_SENT
    : NotificationStatus.SENT
}

export const generateNewSGNotifyParams = (
  agencyLogoUrl: string,
  agencyName: string,
  nric: string,
  agencyShortName: string,
  officerName: string,
  officerPosition: string,
): SGNotifyParams => {
  // TODO: generalise this to support (1) different use cases (2) different notifications (before + during phone call)
  switch (agencyShortName) {
    case 'SPF':
      return {
        agencyLogoUrl,
        agencyName,
        title: 'Verify your phone call',
        nric,
        shortMessage: `You are currently on a call with a public officer from ${agencyShortName}`,
        templateId:
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
        sgNotifyLongMessageParams: {
          agency: agencyShortName,
          officer_name: `<u>${officerName}</u>`,
          position: `<u>${officerPosition}</u>`,
          masked_nric: `(${maskNric(nric)})`,
          call_details: generateCallDetailsNotifyDuringCall(agencyShortName),
        },
        status: SGNotifyNotificationStatus.NOT_SENT,
      }
    case 'OGP':
      return {
        agencyLogoUrl,
        agencyName,
        title: 'Upcoming Phone Call',
        nric,
        shortMessage: `A public officer from ${agencyShortName} will be calling you shortly.`,
        templateId:
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
        sgNotifyLongMessageParams: {
          agency: agencyShortName,
          officer_name: `<u>${officerName}</u>`,
          position: `<u>${officerPosition}</u>`,
          masked_nric: `(${maskNric(nric)})`,
          call_details: generateCallDetailsNotifyBeforeCall(agencyShortName),
          callback_details: ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
        },
        status: SGNotifyNotificationStatus.NOT_SENT,
      }
    default:
      throw new Error(`Unsupported agency: ${agencyShortName}`)
  }
}

export const generateCallDetailsNotifyBeforeCall = (
  agencyId: string,
): string => {
  const standardClosing =
    "This call will be made in the next 10 minutes. You may verify the caller's identity by asking for their <u>name</u> and <u>designation</u>, ensuring that it matches the information provided in this message."
  switch (agencyId) {
    case 'SPF':
      return `The purpose of this call is to follow up on your recent police report/feedback to the Police.
      <br><br>
      ${standardClosing}`
    case 'OGP':
      return `Thank you for agreeing to provide feedback on our products and services. The purpose of the call is to conduct a short feedback interview.
      <br><br>
      ${standardClosing}`
    default:
      return standardClosing
  }
}

export const generateCallDetailsNotifyDuringCall = (
  agencyId: string,
): string => {
  switch (agencyId) {
    case 'SPF':
      return 'The purpose of this call is to follow up on your recent police report/feedback to the Police.'
    default:
      return ' ' // should never reach here
  }
}

export const convertSGNotifyParamsToJWTPayload = (
  sgNotifyParams: SGNotifyParams,
): JWTPayload => {
  const {
    agencyLogoUrl,
    agencyName,
    templateId,
    sgNotifyLongMessageParams,
    title,
    nric,
  } = sgNotifyParams
  const {
    agency,
    masked_nric,
    officer_name,
    position,
    call_details,
    callback_details,
  } = sgNotifyLongMessageParams
  return {
    notification_req: {
      category: 'MESSAGES',
      channel_mode: 'SPM',
      delivery: 'IMMEDIATE',
      priority: 'HIGH',
      sender_logo_small: agencyLogoUrl,
      sender_name: agencyName,
      template_layout: [
        {
          template_id: templateId,
          template_input: {
            agency,
            masked_nric,
            officer_name,
            position,
            call_details,
            callback_details,
          },
        },
      ],
      title,
      uin: nric,
    },
  }
}
// TODO: create class/functions/template that will automatically populate params based on MessageTemplateId?
// import { MessageTemplateId } from '../../database/entities'
//
// export class MessageTemplate {
//   constructor(
//     private readonly id: MessageTemplateId,
//     private readonly params: string[],
//   ) {}
// }
//
// export interface MessageTemplate {
//   id: MessageTemplateId
//   shortMessage: string
//   longMessage: string
//   messageParams: string[]
//   supportsHTML: boolean
// }
