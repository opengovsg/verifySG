import { Injectable, UnauthorizedException } from '@nestjs/common'

import { AgenciesService } from 'agencies/agencies.service'
import { MailerService } from 'common/providers/mailer.service'
import { Logger } from 'core/providers'

import { Officer } from '../database/entities'
import { OfficersService } from '../officers/officers.service'

import { OtpService, OTPVerificationResult } from './otps/otp.service'

import { normalizeEmail } from '~shared/utils/email'

@Injectable()
export class AuthOfficerService {
  constructor(
    private mailerService: MailerService,
    private agencyService: AgenciesService,
    private officersService: OfficersService,
    private otpService: OtpService,
    private logger: Logger,
  ) {}

  async sendOtp(email: string, ipAddress: string): Promise<void> {
    email = normalizeEmail(email)
    // check email whitelist
    const agency = await this.agencyService.findByEmail(email)
    if (!agency) throw new Error(`Email '${email}' not whitelisted`)
    const { otp, timeLeftMinutes } = await this.otpService.getOtp(email)
    const subject = `One-Time Password (OTP) for CheckWho is ${otp}`
    const htmlBody = `Your OTP is <b>${otp}</b>. It will expire in ${timeLeftMinutes} minutes.
    Please use this to login to your account.
    <p>If your OTP does not work, please request for a new one.</p>
    <p>This login attempt was made from the IP: ${ipAddress}. If you did not attempt to log in to CheckWho,
you may choose to investigate this IP to address further.</p>`

    this.logger.log(`Sending mail to ${email}`)
    await this.mailerService.sendMail(subject, htmlBody, email)
  }

  async verifyOtp(email: string, otp: string): Promise<Officer> {
    email = normalizeEmail(email)
    const verificationResult = await this.otpService.verifyOtp(email, otp)
    switch (verificationResult) {
      case OTPVerificationResult.SUCCESS: {
        return await this.officersService.findOrInsertByEmail(email)
      }
      // not sure whether to log additional info for failed verification
      case OTPVerificationResult.EXPIRED_OTP: {
        this.logger.warn(`Unexpired OTP not found for email ${email}`)
        throw new UnauthorizedException(
          'Your OTP may have expired. Please request a new OTP.',
        )
      }
      case OTPVerificationResult.MAX_ATTEMPTS_REACHED: {
        this.logger.warn(`Max OTP attempt reached for ${email}`)
        throw new UnauthorizedException(
          'Incorrect OTP given too many times. Please try again later.',
        )
      }
      case OTPVerificationResult.INCORRECT_OTP: {
        this.logger.warn(`Incorrect OTP given for ${email}`)
        throw new UnauthorizedException(
          'Incorrect OTP given. Please try again.',
        )
      }
      default:
        throw new Error('Unhandled verification result') // should never happen
    }
  }
}
