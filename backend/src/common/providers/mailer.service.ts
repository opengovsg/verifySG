import { Injectable } from '@nestjs/common'
import { Logger } from 'core/providers'
import { ConfigSchema } from 'core/config.schema'

import axios from 'axios'

import { ConfigService } from 'core/providers'

@Injectable()
export class MailerService {
  private config: ConfigSchema['postman']

  constructor(private configService: ConfigService, private logger: Logger) {
    this.config = this.configService.get('postman')
  }

  sendMail = async (
    subject: string,
    body: string,
    recipient: string,
  ): Promise<void> => {
    if (this.configService.get('environment') === 'development')
      return this.logger.log(JSON.stringify({ subject, body }, null, 2))

    const mail = {
      recipient,
      from: 'CheckWho.gov.sg <donotreply@mail.postman.gov.sg>',
      subject,
      body,
    }

    try {
      await axios.post(this.config.apiUrl, mail, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      })
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(e.message)
      }
      throw e
    }
  }
}
