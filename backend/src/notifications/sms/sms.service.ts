import { BadGatewayException, Injectable } from '@nestjs/common'
import twilio from 'twilio'

import { MessageStatus } from 'twilio/lib/rest/api/v2010/account/message'

import { ConfigSchema } from '../../core/config.schema'
import { ConfigService, Logger } from '../../core/providers'
import {
  GOGOVSG_ENDPOINT_ERROR_MESSAGE,
  TWILIO_ENDPOINT_ERROR_MESSAGE,
} from '../constants'
import { GoGovSGService } from '../gogovsg/gogovsg.service'
import {
  AgencyParams,
  OfficerParams,
} from '../sgnotify/message-templates/sgnotify-utils'

import { SmsMessageTemplateParams } from '~shared/types/api'

export interface SMSParams {
  senderId: string
  recipientPhoneNumber: string
  message: string
  status: MessageStatus | null
  sid: string | null // string identifier returned by Twilio
  errorCode: number | null
  errorMessage: string | null
  numSegments: string | null
}

export const supportedAgencies = ['OGP', 'MOM', 'MOH']

@Injectable()
export class SMSService {
  private readonly config: ConfigSchema['twilio']

  constructor(
    private configService: ConfigService,
    private logger: Logger,
    private gogovsgService: GoGovSGService,
  ) {
    this.config = this.configService.get('twilio')
  }

  async sendSMS(
    officerAgency: string,
    smsParams: SMSParams,
  ): Promise<SMSParams> {
    const { accountSid, authToken } =
      this.getAgencyAccountSidAndAuthToken(officerAgency)
    const client = twilio(accountSid, authToken)

    const messageInstance = await client.messages
      .create({
        body: smsParams.message,
        from: smsParams.senderId,
        to: `+65${smsParams.recipientPhoneNumber}`, // need to convert to E.164 format
      })
      .catch((err) => {
        this.logger.error(JSON.stringify(err))
        throw new BadGatewayException(TWILIO_ENDPOINT_ERROR_MESSAGE)
      })
    const { status, sid, errorCode, errorMessage, numSegments } =
      messageInstance
    return {
      ...smsParams,
      status,
      sid,
      errorCode,
      errorMessage,
      numSegments,
    }
  }

  async generateSMSParamsByTemplate(
    recipientPhoneNumber: string,
    agencyParams: Omit<AgencyParams, 'agencyLogoUrl'>, // no need in SMS
    officerParams: OfficerParams,
    params: SmsMessageTemplateParams,
    uniqueParamString: string,
  ): Promise<SMSParams> {
    const { agencyShortName, agencyName } = agencyParams
    const { officerName, officerPosition } = officerParams
    const { message } = params

    const senderId = this.getAgencySenderId(agencyShortName)

    const checkerUrl = `check.go.gov.sg/sms/${uniqueParamString}`
    const shortUrl = `check-sms-${uniqueParamString}` // to pass to Go API
    const shortUrlRes = await this.gogovsgService
      .createShortLink(checkerUrl, shortUrl)
      .catch((err) => {
        this.logger.error(JSON.stringify(err))
        // 1. currently, for reasons I don't understand, this error message is not shown on the frontend but still logged on the backend
        // 2. for future extension, we can consider just using check.go.gov.sg URL directly instead of shortening it to avoid additional API call
        throw new BadGatewayException(GOGOVSG_ENDPOINT_ERROR_MESSAGE)
      })
    // included in SMS
    const embeddedUrl =
      this.configService.get('environment') === 'production'
        ? `go.gov.sg/${shortUrlRes}`
        : `staging.go.gov.sg/${shortUrlRes}`

    return {
      senderId,
      recipientPhoneNumber,
      // hardcode for now, in theory should support variable number of params
      message: message
        .replace('{{officerName}}', officerName)
        .replace('{{officerPosition}}', officerPosition)
        .replace('{{agencyName}}', agencyName)
        .replace('{{uniqueUrl}}', embeddedUrl),
      status: null,
      sid: null,
      errorCode: null,
      errorMessage: null,
      numSegments: null,
    }
  }

  getAgencySenderId = (officerAgency: string): string => {
    switch (officerAgency) {
      case 'OGP':
        return this.config.ogpCredentials.senderId
      case 'MOH':
        return this.config.mohCredentials.senderId
      case 'MOM':
        return this.config.momCredentials.senderId
      default:
        return this.config.defaultCredentials.senderId
    }
  }

  getAgencyAccountSidAndAuthToken = (
    officerAgency: string,
  ): { accountSid: string; authToken: string } => {
    switch (officerAgency) {
      case 'OGP':
        return {
          accountSid: this.config.ogpCredentials.accountSid,
          authToken: this.config.ogpCredentials.authToken,
        }
      case 'MOH':
        return {
          accountSid: this.config.mohCredentials.accountSid,
          authToken: this.config.mohCredentials.authToken,
        }
      case 'MOM':
        return {
          accountSid: this.config.momCredentials.accountSid,
          authToken: this.config.momCredentials.authToken,
        }
      default:
        return {
          accountSid: this.config.defaultCredentials.accountSid,
          authToken: this.config.defaultCredentials.authToken,
        }
    }
  }
}
