import { Injectable } from '@nestjs/common'
import twilio from 'twilio'

import { ConfigSchema } from '../../core/config.schema'
import { ConfigService } from '../../core/providers'

import { SMSParams, TwilioMessageStatus } from './sms-utils'

@Injectable()
export class SMSService {
  private readonly config: ConfigSchema['twilio']

  constructor(private configService: ConfigService) {
    this.config = this.configService.get('twilio')
  }

  async sendSMS(
    officerAgency: string,
    smsParams: SMSParams,
  ): Promise<SMSParams> {
    // will refactor this ugly code once we have agency credentials managed in DB
    let accountSid
    let authToken
    // if environment is not production, just send using default credentials
    // else, use agency credentials
    if (process.env.NODE_ENV !== 'production') {
      accountSid = this.config.defaultCredentials.accountSid
      authToken = this.config.defaultCredentials.authToken
    } else {
      switch (officerAgency) {
        case 'OGP':
          accountSid = this.config.ogpCredentials.accountSid
          authToken = this.config.ogpCredentials.authToken
          break
        case 'MOH':
          accountSid = this.config.mohCredentials.accountSid
          authToken = this.config.mohCredentials.authToken
          break
        case 'MOM':
          accountSid = this.config.momCredentials.accountSid
          authToken = this.config.momCredentials.authToken
          break
        default:
          throw new Error('Invalid agency')
      }
    }
    const client = twilio(accountSid, authToken)
    const result = await client.messages.create({
      body: smsParams.message,
      from: smsParams.senderPhoneNumber,
      to: `+65${smsParams.recipientPhoneNumber}`, // need to convert to E.164 format
    })
    // TODO deal with error cases
    console.log(result)
    return {
      ...smsParams,
      status: result.status as TwilioMessageStatus,
      sid: result.sid,
    }
  }
}
