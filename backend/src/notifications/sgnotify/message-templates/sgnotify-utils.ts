import {
  IsOptional,
  IsString,
  IsUppercase,
  IsUrl,
  MaxLength,
  validateOrReject,
} from 'class-validator'

import { Agency } from '../../../database/entities'
import {
  SGNotifyNotificationRequest,
  SGNotifyNotificationRequestPayload,
} from '../dto'

import { IsNric } from '~shared/decorators'
import { SGNotifyMessageTemplateParams } from '~shared/types/api'
import { maskNric } from '~shared/utils/nric'
import {
  SGNotifyMessageTemplateId,
  sgNotifyShortMessage,
  sgNotifyTitle,
} from '~shared/utils/sgnotify'

export enum SGNotifyNotificationStatus {
  NOT_SENT = 'NOT_SENT',
  SENT_BY_SERVER = 'SENT_BY_SERVER',
  // last two enums unused for now; can be obtained by consuming notification status endpoints
  RECEIVED_BY_DEVICE = 'RECEIVED_BY_DEVICE',
  READ_BY_USER = 'READ_BY_USER',
}

// see SGNotifyNotificationRequest, which is similar
export class SGNotifyParams {
  @IsString()
  @IsUppercase()
  agencyShortName: Agency['id']

  @IsString()
  @IsUrl()
  agencyLogoUrl: Agency['logoUrl']

  @IsString()
  @MaxLength(50)
  title: string

  @IsString()
  @MaxLength(100)
  shortMessage: string

  @IsNric()
  nric: string

  templateId: SGNotifyMessageTemplateId

  params: Record<string, string>

  status: SGNotifyNotificationStatus

  @IsOptional()
  @IsString()
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

// these are the params that are independent of templateId
// extracted out for clarity and to minimize repetition in generateNewSGNotifyParams
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
    params: {
      agency: agencyName,
      officer_name: `<u>${officerName}</u>`,
      position: `<u>${officerPosition}</u>`,
      masked_nric: `(${maskNric(nric)})`,
    },
    status: SGNotifyNotificationStatus.NOT_SENT,
  }
}

export const generateNewSGNotifyParams = async (
  nric: string,
  agencyParams: AgencyParams,
  officerParams: OfficerParams,
  templateParams: SGNotifyMessageTemplateParams,
): Promise<SGNotifyParams> => {
  const genericSGNotifyParams = generateGenericSGNotifyParams(
    nric,
    agencyParams,
    officerParams,
  )
  const { agencyShortName } = agencyParams
  const { templateId, longMessageParams } = templateParams
  const title = sgNotifyTitle(templateId)
  const shortMessage = sgNotifyShortMessage(templateId, agencyShortName)
  const sgNotifyParams = new SGNotifyParams()
  switch (templateId) {
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_BEFORE_PHONE_CALL:
      Object.assign(sgNotifyParams, {
        ...genericSGNotifyParams,
        templateId,
        title,
        shortMessage,
        params: {
          ...genericSGNotifyParams.params,
          call_details: longMessageParams.call_details,
          callback_details: longMessageParams.callback_details || ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
        },
      })
      break
    case SGNotifyMessageTemplateId.GENERIC_NOTIFICATION_DURING_PHONE_CALL:
      Object.assign(sgNotifyParams, {
        ...genericSGNotifyParams,
        templateId,
        title,
        shortMessage,
        params: {
          ...genericSGNotifyParams.params,
          call_details: longMessageParams.call_details,
        },
      })
      break
    default:
      // strictly speaking untrue; we wish to avoid supporting specific templates as far as possible
      // also, in terms of throwing error, this would've been caught in the above sgNotifyTitle and sgNotifyShortMessage functions
      throw new Error(`Unsupported SGNotify templateId: ${templateId}`)
  }
  await validateOrReject(sgNotifyParams).catch((errors) => {
    throw new Error(`Invalid parameters in notification request: ${errors}`)
  })
  return sgNotifyParams
}

export const convertParamsToNotificationRequestPayload = (
  sgNotifyParams: SGNotifyParams,
): SGNotifyNotificationRequestPayload => {
  const { agencyLogoUrl, agencyShortName, templateId, params, title, nric } =
    sgNotifyParams
  // this destructuring is untyped, be careful!
  const {
    agency,
    masked_nric,
    officer_name,
    position,
    call_details,
    callback_details,
  } = params
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
  return {
    notification_req: notificationRequest,
  }
}
