import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import { Request, Response } from 'express'

import {
  OfficerWhoamiResDto,
  GetOtpReqDto,
  VerifyOtpReqDto,
} from '~shared/types/api'
import { AuthOfficerService } from './auth-officer.service'
import { ConfigService, Logger } from 'core/providers'
import { OfficerId } from 'common/decorators'
import { OfficersService } from '../officers/officers.service'
import { getRequestIp } from '../common/utils'

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
    if (officer) req.session.officerId = officer.id
  }

  @Get('whoami')
  async whoami(@OfficerId() officerId: number): Promise<OfficerWhoamiResDto> {
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
