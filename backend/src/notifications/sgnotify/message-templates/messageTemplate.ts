import {
  NotificationStatus,
  SGNotifyNotificationStatus,
} from '../../../database/entities'
import { maskNric } from '../utils'
import { JWTPayload } from 'jose'

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
  GENERIC_PHONE_CALL = 'GOVTECH-CHECKWHO-GEN-01',
  // last two enums unused for now; GENERIC_PHONE_CALL template might be subject to editing by GovTech CMG though
  SPF_POLICE_REPORT_PHONE_CALL = 'GOVTECH-CHECKWHO-01',
  GOVTECH_FEEDBACK_PHONE_CALL = 'GOVTECH-CHECKWHO-GT-01',
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
  return {
    agencyLogoUrl,
    agencyName,
    title: 'Upcoming Phone Call',
    nric,
    shortMessage: `A public officer from ${agencyShortName} will be calling you shortly.`,
    templateId: SGNotifyMessageTemplateId.GENERIC_PHONE_CALL, // current strategy is to use generic template for all messages
    sgNotifyLongMessageParams: {
      agency: agencyShortName,
      officer_name: `<u>${officerName}</u>`,
      position: `<u>${officerPosition}</u>`,
      masked_nric: `(${maskNric(nric)})`,
      call_details: generateCallDetails(agencyShortName),
      callback_details: ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
    },
    status: SGNotifyNotificationStatus.NOT_SENT,
  }
}

// TODO: modify this method to support different call details
// currently, content of call details based on agencyShortName only; to include "use case id"?
export const generateCallDetails = (agencyId: string): string => {
  const standardClosing =
    "This call will be made in the next 10 minutes. You may verify the caller's identity by asking for their <u>name</u> and <u>designation</u>, ensuring that it matches the information provided in this message."
  switch (agencyId) {
    case 'SPF':
      return `The purpose of the call is to follow up on a police report that you have lodged recently.
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
