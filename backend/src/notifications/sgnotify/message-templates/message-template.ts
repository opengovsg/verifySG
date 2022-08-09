import { validateOrReject } from 'class-validator'

import {
  NotificationStatus,
  SGNotifyNotificationStatus,
} from '../../../database/entities'
import {
  SGNotifyNotificationRequest,
  SGNotifyNotificationRequestPayload,
} from '../dto'

import { SGNotifyMessageTemplateParams } from '~shared/types/api'
import { maskNric } from '~shared/utils/nric'
import { SGNotifyMessageTemplateId } from '~shared/utils/sgnotify'

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

export interface AgencyParams {
  agencyShortName: string
  agencyName: string
  agencyLogoUrl: string
}

export interface OfficerParams {
  officerName: string
  officerPosition: string
}

export const sgNotifyParamsStatusToNotificationStatusMapper = (
  params: SGNotifyParams,
): NotificationStatus => {
  return params.status === SGNotifyNotificationStatus.NOT_SENT
    ? NotificationStatus.NOT_SENT
    : NotificationStatus.SENT
}

const generateGenericSGNotifyParams = (
  nric: string,
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
): Omit<SGNotifyParams, 'templateId' | 'title' | 'shortMessage'> => {
  const { agencyShortName, agencyName, agencyLogoUrl } = agencyParams
  const { officerName, officerPosition } = officerParams
  return {
    agencyLogoUrl,
    agencyShortName,
    nric,
    sgNotifyLongMessageParams: {
      agency: agencyName,
      officer_name: `<u>${officerName}</u>`,
      position: `<u>${officerPosition}</u>`,
      masked_nric: `(${maskNric(nric)})`,
    },
    status: SGNotifyNotificationStatus.NOT_SENT,
  }
}

export const generateNewSGNotifyParams = (
  nric: string,
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
  templateParams: SGNotifyMessageTemplateParams,
): SGNotifyParams => {
  const genericSGNotifyParams = generateGenericSGNotifyParams(
    nric,
    agencyParams,
    officerParams,
  )
  const { agencyShortName } = agencyParams
  const { templateId, longMessageParams } = templateParams
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return {
        ...genericSGNotifyParams,
        templateId,
        title: 'Upcoming Phone Call',
        shortMessage: `A public officer from ${agencyShortName} will be calling you shortly`,
        sgNotifyLongMessageParams: {
          ...genericSGNotifyParams.sgNotifyLongMessageParams,
          call_details: longMessageParams.call_details,
          callback_details: longMessageParams.callback_details || ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
        },
      }
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return {
        ...genericSGNotifyParams,
        templateId,
        title: 'Verify your phone call',
        shortMessage: `You are currently on a call with a public officer from ${agencyShortName}`,
        sgNotifyLongMessageParams: {
          ...genericSGNotifyParams.sgNotifyLongMessageParams,
          call_details: longMessageParams.call_details,
        },
      }
    default:
      // strictly speaking untrue; wei wish to avoid supporting specific templates as far as possible
      throw new Error(`Unsupported SGNotify templateId: ${templateId}`)
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
