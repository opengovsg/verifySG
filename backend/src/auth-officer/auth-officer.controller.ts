import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { Request, Response } from 'express'

import { OfficerAgency, OfficerEmail, OfficerId } from 'common/decorators'
import { ConfigService, Logger } from 'core/providers'

import { getRequestIp } from '../common/utils'
import { OfficersService } from '../officers/officers.service'

import { AuthOfficerService } from './auth-officer.service'

import {
  GetOtpReqDto,
  OfficerWhoamiResDto,
  VerifyOtpReqDto,
} from '~shared/types/api'

@Controller('auth-officers')
export class AuthOfficerController {
  constructor(
    private readonly authOfficerService: AuthOfficerService,
    private logger: Logger,
    private config: ConfigService,
    private officersService: OfficersService,
  ) {}

  @Post()
  async sendOTP(
    @Body() body: GetOtpReqDto,
    @Req() req: Request,
  ): Promise<void> {
    const { email } = body
    try {
      const ipAddress = getRequestIp(req)
      return await this.authOfficerService.sendOtp(email, ipAddress)
    } catch (err) {
      throw new BadRequestException(
        err instanceof Error ? err.message : 'Failed to send OTP',
      )
    }
  }

  @Post('verify')
  async verifyOTP(
    @Body() body: VerifyOtpReqDto,
    @Req() req: Request,
  ): Promise<void> {
    const { email, otp } = body
    const officer = await this.authOfficerService.verifyOtp(email, otp)
    if (officer) {
      req.session.officerId = officer.id
      req.session.officerEmail = officer.email
      req.session.officerAgency = officer.agency.id
    }
  }

  @Get('whoami')
  async whoami(
    @OfficerId() officerId: number,
    @OfficerEmail() officerEmail: string,
    @OfficerAgency() officerAgency: string,
  ): Promise<OfficerWhoamiResDto> {
    if (!officerId) {
      return { authenticated: false, message: 'No logged in officer' }
    }
    return {
      authenticated: true,
      email: officerEmail,
      agencyShortName: officerAgency,
    }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): void {
    req.session.destroy(() => null)
    res.clearCookie(this.config.get('session.name'))
  }
}
