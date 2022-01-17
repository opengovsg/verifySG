import { Injectable } from '@nestjs/common'
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer'
import aws from '@aws-sdk/client-ses'

import { ConfigService } from 'core/providers'

@Injectable()
export class MailerService {
  private mailer: Pick<Transporter, 'sendMail'>

  constructor(private config: ConfigService) {
    const region = this.config.get('awsRegion')
    const ses = new aws.SES({
      apiVersion: '2010-12-01',
      region,
    })
    this.mailer = nodemailer.createTransport({
      SES: { ses, aws },
    })
  }

  sendMail = async (mailOptions: SendMailOptions): Promise<void> => {
    return this.mailer.sendMail(mailOptions)
  }
}
