import { Injectable } from '@nestjs/common'
import { totp as totpFactory } from 'otplib'

import { ConfigService } from 'core/providers'
import { ConfigSchema } from 'core/config.schema'

const NUM_MINUTES_IN_AN_HOUR = 60

@Injectable()
export class OtpService {
  private totp
  private config: ConfigSchema['totp']
  private secret: string

  constructor(private configService: ConfigService) {
    this.config = this.configService.get('totp')
    const { expiry, numValidPastWindows, numValidFutureWindows, secret } =
      this.config
    this.totp = totpFactory.clone({
      step: expiry,
      window: [numValidPastWindows, numValidFutureWindows],
    })
    this.secret = secret
  }

  private formatEmail(email: string): string {
    return email.toLowerCase()
  }

  private concatSecretWithEmail(email: string): string {
    return this.secret + email
  }

  generateOtp(email: string): { token: string; timeLeft: number } {
    email = this.formatEmail(email)
    const token = this.totp.generate(this.concatSecretWithEmail(email))
    const timeLeft = this.totp.options.step
      ? Math.floor(this.totp.options.step / NUM_MINUTES_IN_AN_HOUR) // Round down to minutes
      : NaN
    return { token, timeLeft }
  }

  verifyOtp(email: string, token: string): boolean {
    email = this.formatEmail(email)
    return this.totp.verify({
      secret: this.concatSecretWithEmail(email),
      token,
    })
  }
}
