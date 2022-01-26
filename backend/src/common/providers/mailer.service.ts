import { Injectable } from '@nestjs/common'
import { Logger } from 'core/providers'
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer'
import aws from '@aws-sdk/client-ses'

import { ConfigService } from 'core/providers'

@Injectable()
export class MailerService {
  constructor(private config: ConfigService, private logger: Logger) {}

  private mailer: Pick<Transporter, 'sendMail'> =
    this.config.get('environment') === 'development'
      ? {
          sendMail: (options: SendMailOptions) => {
            this.logger.log(JSON.stringify(options, null, 2))
            return Promise.resolve(options)
          },
        }
      : nodemailer.createTransport({
          SES: new aws.SES({
            region: this.config.get('awsRegion'),
            apiVersion: '2010-12-01',
          }),
        })

  sendMail = async (mailOptions: SendMailOptions): Promise<void> => {
    return this.mailer.sendMail(mailOptions)
  }
}
