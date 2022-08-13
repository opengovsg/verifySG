import { validateOrReject } from 'class-validator'

import {
  NotificationStatus,
  SGNotifyNotificationStatus,
} from '../../../database/entities'
import {
  SGNotifyNotificationRequest,
  SGNotifyNotificationRequestPayload,
} from '../dto'

import { maskNric } from '~shared/utils/nric'
import {
  generateCallDetails,
  SGNotifyMessageTemplateId,
  sgNotifyShortMessage,
  sgNotifyTitle,
} from '~shared/utils/sgnotify'

export interface SGNotifyParams {
  agencyLogoUrl: string
  agencyShortName: string
  title: string
  nric: string
  shortMessage: string
  templateId: SGNotifyMessageTemplateId
  sgNotifyLongMessageParams: Record<string, string>
  status: SGNotifyNotificationStatus
  requestId?: string
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
        agencyShortName,
        title: sgNotifyTitle(
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
        ),
        nric,
        shortMessage: `${sgNotifyShortMessage(agencyShortName)}`,
        templateId:
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
        sgNotifyLongMessageParams: {
          agency: agencyName,
          officer_name: `<u>${officerName}</u>`,
          position: `<u>${officerPosition}</u>`,
          masked_nric: `(${maskNric(nric)})`,
          call_details: generateCallDetails(
            agencyShortName,
            SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL,
          ),
        },
        status: SGNotifyNotificationStatus.NOT_SENT,
      }
    case 'OGP':
    case 'MSF':
    case 'ECDA':
    case 'IRAS':
    case 'MOH':
      return {
        agencyLogoUrl,
        agencyShortName,
        title: sgNotifyTitle(
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
        ),
        nric,
        shortMessage: `${sgNotifyShortMessage(agencyShortName)}`,
        templateId:
          SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
        sgNotifyLongMessageParams: {
          agency: agencyName,
          officer_name: `<u>${officerName}</u>`,
          position: `<u>${officerPosition}</u>`,
          masked_nric: `(${maskNric(nric)})`,
          call_details: generateCallDetails(
            agencyShortName,
            SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL,
          ),
          callback_details: ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
        },
        status: SGNotifyNotificationStatus.NOT_SENT,
      }
    default:
      throw new Error(`Unsupported agency: ${agencyShortName}`)
  }
}

export const convertParamsToNotificationRequestPayload = async (
  sgNotifyParams: SGNotifyParams,
): Promise<SGNotifyNotificationRequestPayload> => {
  const {
    agencyLogoUrl,
    agencyShortName,
    templateId,
    sgNotifyLongMessageParams,
    title,
    nric,
  } = sgNotifyParams
  // this destructuring is untyped, be careful!
  const {
    agency,
    masked_nric,
    officer_name,
    position,
    call_details,
    callback_details,
  } = sgNotifyLongMessageParams
  const notificationRequest = Object.assign(new SGNotifyNotificationRequest(), {
    category: 'MESSAGES',
    channel_mode: 'SPM',
    delivery: 'IMMEDIATE',
    priority: 'HIGH',
    sender_logo_small: agencyLogoUrl,
    sender_name: agencyShortName,
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
  })
  await validateOrReject(notificationRequest).catch((errors) => {
    throw new Error(`Invalid notification request: ${errors}`)
  })
  return {
    notification_req: notificationRequest,
  }
}
