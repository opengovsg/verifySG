import { Injectable } from '@nestjs/common'

import { Officer } from 'database/entities/officer.entity'
import { OfficersService } from 'officers/officers.service'
import { MailerService } from 'common/providers/mailer.service'

import { OtpService } from './otp.service'

import { Logger } from 'core/providers'

@Injectable()
export class AuthOfficerService {
  constructor(
    private officerService: OfficersService,
    private mailerService: MailerService,
    private otpService: OtpService,
    private logger: Logger,
  ) {}

  async sendOTP(email: string): Promise<void> {
    const { token, timeLeft } = this.otpService.generateOtp(email)
    const html = `Your OTP is <b>${token}</b>. It will expire in ${timeLeft} minutes.
    Please use this to login to your account.
    <p>If your OTP does not work, please request for a new one.</p>`

    const mail = {
      to: email,
      from: 'WhoDis.gov.sg <donotreply@mail.open.gov.sg>',
      subject: 'One-Time Password (OTP) for WhoThis',
      html,
    }

    this.logger.log(`Sending mail to ${email}`)
    return this.mailerService.sendMail(mail)
  }

  async verifyOTP(email: string, token: string): Promise<Officer | undefined> {
    const isVerified = this.otpService.verifyOtp(email, token)
    const officer = isVerified
      ? await this.officerService.findOrInsert({ email })
      : undefined

    return officer
  }
}
