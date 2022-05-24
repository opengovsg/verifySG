import { Injectable } from '@nestjs/common'

import { ConfigService, Logger } from 'core/providers'
import { ConfigSchema } from 'core/config.schema'
import { normalizeEmail } from '../common/utils'
import {
  convertMillisecondsToMinutes,
  generateOtpAndHash,
  verifyOtpWithHash,
} from './utils'
import { InjectRepository } from '@nestjs/typeorm'
import { OTP } from '../database/entities'
import { Repository } from 'typeorm'

export enum OTPVerificationResult {
  SUCCESS = 'success',
  INCORRECT_OTP = 'incorrect otp',
  EXPIRED_OTP = 'expired otp',
  MAX_ATTEMPTS_REACHED = 'max attempts reached',
}

@Injectable()
export class OtpService {
  private readonly config: ConfigSchema['otp']
  constructor(
    @InjectRepository(OTP)
    private otpRepository: Repository<OTP>,
    private configService: ConfigService,
    private logger: Logger,
  ) {
    this.config = this.configService.get('otp')
  }

  async findOTPByEmail(email: string): Promise<OTP | undefined> {
    email = normalizeEmail(email)
    return this.otpRepository.findOne({
      where: {
        email,
      },
      order: {
        createdAt: 'DESC', // if more than one, always get latest OTP
      },
    })
  }

  async incrementAttemptCount(otpId: number): Promise<void> {
    const otp = await this.otpRepository.findOne(otpId)
    if (!otp) {
      throw new Error(`OTP not found for id ${otpId}`)
    }
    await this.otpRepository.save({
      ...otp,
      numOfAttempts: otp.numOfAttempts + 1,
    })
  }

  async getOtp(
    email: string,
  ): Promise<{ otp: string; timeLeftMinutes: string }> {
    email = normalizeEmail(email)
    const { expiryPeriod, numSaltRounds } = this.config
    const { otp, hash } = await generateOtpAndHash(numSaltRounds)
    const otpToAdd = this.otpRepository.create({
      email,
      hash,
      expiredAt: new Date(Date.now() + expiryPeriod),
    })
    await this.otpRepository.save(otpToAdd)

    return {
      otp,
      timeLeftMinutes: `${convertMillisecondsToMinutes(expiryPeriod)}`,
    }
  }

  async verifyOtp(email: string, otp: string): Promise<OTPVerificationResult> {
    email = normalizeEmail(email)
    const otpFromDb = await this.findOTPByEmail(email)
    if (!otpFromDb) {
      this.logger.warn(
        // feel like we should log the IP address of the caller and potentially block it?
        `Unable to find OTP corresponding to email '${email}'. This suggests API call is NOT made from frontend.`,
      )
      // strictly not correct, but we don't want to expose this to frontend
      return OTPVerificationResult.INCORRECT_OTP
    }
    const { id, expiredAt, hash, numOfAttempts } = otpFromDb
    if (expiredAt.getTime() < Date.now()) {
      return OTPVerificationResult.EXPIRED_OTP
    }
    if (numOfAttempts >= this.config.numAllowedAttempts) {
      await this.incrementAttemptCount(id) // not strictly necessary, but helps to identify brute force attack
      return OTPVerificationResult.MAX_ATTEMPTS_REACHED
    }
    await this.incrementAttemptCount(id)
    const isValid = verifyOtpWithHash(otp, hash)
    if (!isValid) return OTPVerificationResult.INCORRECT_OTP
    // OTP is valid, hard delete OTP from db after verification to prevent reuse
    await this.otpRepository.delete(id)
    return OTPVerificationResult.SUCCESS
  }
}
