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
  if (params.status === SGNotifyNotificationStatus.NOT_SENT)
    return NotificationStatus.NOT_SENT
  else return NotificationStatus.SENT
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
    templateId: SGNotifyMessageTemplateId.GENERIC_PHONE_CALL,
    sgNotifyLongMessageParams: {
      agency: agencyShortName,
      officer_name: officerName,
      position: officerPosition,
      masked_nric: `(${maskNric(nric)})`,
      call_details: generateCallDetails(agencyShortName),
      callback_details: ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
    },
    status: SGNotifyNotificationStatus.NOT_SENT,
  }
}

export const generateCallDetails = (agencyId: string): string => {
  switch (agencyId) {
    case 'SPF':
      // TODO: mention police report
      return 'This call will be made in the next 10 minutes. Please verify the person calling you is indeed a public officer using the name and position provided in this message.'
    case 'OGP':
      // TODO: mention collecting feedback
      return 'This call will be made in the next 10 minutes. Please verify the person calling you is indeed a public officer using the name and position provided in this message.'
    default:
      return 'This call will be made in the next 10 minutes. Please verify the person calling you is indeed a public officer using the name and position provided in this message.'
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
// TODO: create class/functions/template that will automatically populate params based on MessageTemplateId
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
