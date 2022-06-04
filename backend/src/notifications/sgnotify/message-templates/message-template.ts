import { JWTPayload } from 'jose'

import {
  NotificationStatus,
  SGNotifyNotificationStatus,
  SGNotifyTemplateParams,
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

export interface AgencyParams {
  agencyShortName: string
  agencyName: string
  agencyLogoUrl: string
}

export interface OfficerParams {
  officerName: string
  officerPosition: string
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
    agencyName,
    nric,
    sgNotifyLongMessageParams: {
      agency: agencyShortName,
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
  templateParams: SGNotifyTemplateParams,
): SGNotifyParams => {
  const genericSGNotifyParams = generateGenericSGNotifyParams(
    nric,
    agencyParams,
    officerParams,
  )
  const { agencyShortName } = agencyParams
  const { templateId, templatePurposeParams } = templateParams
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      return {
        ...genericSGNotifyParams,
        templateId,
        title: 'Upcoming Phone Call',
        shortMessage: `A public officer from ${agencyShortName} will be calling you shortly`,
        sgNotifyLongMessageParams: {
          // DANGER: be careful about these params; they are template-specific and not typed
          ...genericSGNotifyParams.sgNotifyLongMessageParams,
          call_details: templatePurposeParams.call_details,
          callback_details: templatePurposeParams.callback_details || ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
        },
      }
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      return {
        ...genericSGNotifyParams,
        templateId,
        title: 'Verify your phone call',
        shortMessage: `You are currently on a call with a public officer from ${agencyShortName}`,
        sgNotifyLongMessageParams: {
          // DANGER: be careful about these params; they are template-specific and not typed
          ...genericSGNotifyParams.sgNotifyLongMessageParams,
          call_details: templatePurposeParams.call_details,
        },
      }
    default:
      // strictly speaking untrue; wei wish to avoid supporting specific templates as far as possible
      throw new Error(`Unsupported SGNotify templateId: ${templateId}`)
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
