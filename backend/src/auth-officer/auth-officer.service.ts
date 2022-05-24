import { Injectable } from '@nestjs/common'

import { MailerService } from 'common/providers/mailer.service'
import { AgenciesService } from 'agencies/agencies.service'

import { OtpService } from '../otps/otp.service'

import { Logger } from 'core/providers'
import { normalizeEmail } from '../common/utils'

@Injectable()
export class AuthOfficerService {
  constructor(
    private mailerService: MailerService,
    private agencyService: AgenciesService,
    private otpService: OtpService,
    private logger: Logger,
  ) {}

  async sendOTP(email: string): Promise<void> {
    email = normalizeEmail(email)
    // check email whitelist
    const agency = await this.agencyService.findByEmail(email)
    if (!agency) throw new Error(`Email '${email}' not whitelisted`)

    const { otp, timeLeftMinutes } = await this.otpService.getOtp(email)
    const htmlBody = `Your OTP is <b>${otp}</b>. It will expire in ${timeLeftMinutes} minutes.
    Please use this to login to your account.
    <p>If your OTP does not work, please request for a new one.</p>`

    this.logger.log(`Sending mail to ${email}`)
    await this.mailerService.sendMail(htmlBody, email)
  }
}
