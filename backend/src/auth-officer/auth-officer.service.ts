import { Injectable } from '@nestjs/common'

import { Officer } from 'database/entities/officer.entity'
import { OfficersService } from 'officers/officers.service'
import { MailerService } from 'common/providers/mailer.service'
import { AgenciesService } from 'agencies/agencies.service'

import { OtpService } from './otp.service'

import { Logger } from 'core/providers'

@Injectable()
export class AuthOfficerService {
  constructor(
    private officerService: OfficersService,
    private mailerService: MailerService,
    private agencyService: AgenciesService,
    private otpService: OtpService,
    private logger: Logger,
  ) {}

  async sendOTP(email: string): Promise<void> {
    // check email whitelist
    const agency = await this.agencyService.findByEmail(email)
    if (!agency) throw new Error(`Email '${email}' not whitelisted`)

    const { token, timeLeft } = this.otpService.generateOtp(email)
    const htmlBody = `Your OTP is <b>${token}</b>. It will expire in ${timeLeft} minutes.
    Please use this to login to your account.
    <p>If your OTP does not work, please request for a new one.</p>`

    this.logger.log(`Sending mail to ${email}`)
    await this.mailerService.sendMail(htmlBody, email)
  }

  async verifyOTP(email: string, token: string): Promise<Officer | undefined> {
    const isVerified = this.otpService.verifyOtp(email, token)
    return isVerified
      ? await this.officerService.findOrInsert({ email })
      : undefined
  }
}
