import {
  AgencyParams,
  OfficerParams,
} from '../sgnotify/message-templates/sgnotify-utils'

import { SMSMessageTemplateParams } from '~shared/types/api'

interface AgencyTwilioDetails {
  phoneNumber: string
  senderId: string | null
}

export enum TwilioMessageStatus {
  NOT_SENT = 'NOT_SENT',
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  UNDELIVERED = 'undelivered',
  FAILED = 'failed',
}

export interface SMSParams {
  senderId: string | null

  senderPhoneNumber: string

  recipientPhoneNumber: string

  message: string

  status: TwilioMessageStatus

  sid: string | null // string identifier returned by Twilio
}

export const supportedAgencies: Record<string, AgencyTwilioDetails> = {
  DEFAULT: {
    phoneNumber: '+13254238044',
    senderId: null,
  },
  OGP: {
    phoneNumber: '+13254238044',
    senderId: null,
  },
  MOH: {
    phoneNumber: '+6582410045', // TODO: Replace with MOH's number
    senderId: 'MOH',
  },
  MOM: {
    phoneNumber: '+6582410045', // TODO replace with MOM's number
    senderId: 'MOM',
  },
}

export const generateSMSParamsByTemplate = (
  recipientPhoneNumber: string,
  agencyParams: Omit<AgencyParams, 'agencyLogoUrl'>, // no need in SMS
  officerParams: OfficerParams,
  params: SMSMessageTemplateParams,
): SMSParams => {
  const { agencyShortName, agencyName } = agencyParams
  const { officerName, officerPosition } = officerParams
  const { message } = params

  const { senderId, phoneNumber: senderPhoneNumber } =
    supportedAgencies[agencyShortName] || supportedAgencies.DEFAULT

  return {
    senderId,
    senderPhoneNumber,
    recipientPhoneNumber,
    message: message
      // hardcode for now, in theory should support variable number of params
      .replace('{{officerName}}', officerName)
      .replace('{{officerPosition}}', officerPosition)
      .replace('{{agencyName}}', agencyName),
    status: TwilioMessageStatus.NOT_SENT,
    sid: null,
  }
}
