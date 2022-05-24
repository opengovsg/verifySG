import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common'
import { OfficerDto, OfficerWhoamiDto } from 'officers/dto'
import { AuthOfficerService } from './auth-officer.service'
import { ConfigService, Logger } from 'core/providers'
import { Request, Response } from 'express'

import { OtpAuthVerifyDto } from './dto/otp-auth-verify.dto'
import { OfficerId } from 'common/decorators'
import { OfficersService } from 'officers/officers.service'
import { OtpService, OTPVerificationResult } from '../otps/otp.service'

@Controller('auth-officers')
export class AuthOfficerController {
  constructor(
    private readonly authOfficerService: AuthOfficerService,
    private logger: Logger,
    private config: ConfigService,
    private officersService: OfficersService,
    private otpService: OtpService,
  ) {}

  @Post()
  async sendOTP(@Body() body: OfficerDto): Promise<void> {
    const { email } = body
    try {
      return await this.authOfficerService.sendOTP(email)
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Failed to send OTP',
      )
    }
  }

  @Post('verify')
  async verifyOTP(
    @Body() body: OtpAuthVerifyDto,
    @Req() req: Request,
  ): Promise<void> {
    const { email, otp } = body
    const verificationResult = await this.otpService.verifyOtp(email, otp)
    switch (verificationResult) {
      case OTPVerificationResult.SUCCESS: {
        const officer = await this.officersService.findOrInsert({ email })
        req.session.officerId = officer.id
        return
      }
      // not sure whether to log additional info for failed verification
      case OTPVerificationResult.OTP_EXPIRED: {
        this.logger.warn(`Unexpired OTP not found for email ${email}`)
        throw new UnauthorizedException(
          'This OTP has expired. Please request a new OTP.',
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

  @Get('whoami')
  async whoami(@OfficerId() officerId: number): Promise<OfficerWhoamiDto> {
    if (!officerId) {
      return { message: 'No logged in officer' }
    }
    const officer = await this.officersService.findById(officerId)
    if (!officer) {
      throw new NotFoundException('No officer with this officer ID found')
    }
    const { email } = officer
    return { email }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): void {
    req.session.destroy(() => null)
    res.clearCookie(this.config.get('session.name'))
  }
}
