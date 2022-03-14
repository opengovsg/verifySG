import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { OfficerDto } from 'officers/dto'
import { AuthOfficerService } from './auth-officer.service'
import { ConfigService } from 'core/providers'
import { Logger } from 'core/providers'
import { Request, Response } from 'express'

import { OtpAuthVerify } from './dto/otp-auth-verify'
import { OfficerId } from 'common/decorators'
import { OfficersService } from 'officers/officers.service'

@Controller('auth-officers')
export class AuthOfficerController {
  constructor(
    private readonly authOfficerService: AuthOfficerService,
    private logger: Logger,
    private config: ConfigService,
    private officersService: OfficersService,
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
    @Body() body: OtpAuthVerify,
    @Req() req: Request,
  ): Promise<void> {
    const { email, token } = body
    const officer = await this.authOfficerService.verifyOTP(email, token)
    if (officer) {
      req.session.officerId = officer.id
    } else {
      this.logger?.warn(`Incorrect OTP given for ${email}`)
      throw new UnauthorizedException(`Incorrect OTP given`)
    }
  }

  @Get('whoami')
  async whoami(
    @OfficerId() officerId: number,
  ): Promise<OfficerDto | undefined> {
    if (officerId) {
      const officer = await this.officersService.getById(officerId)
      if (officer) {
        const { email } = officer
        return { email }
      }
    }
    return
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): void {
    req.session.destroy(() => null)
    res.clearCookie(this.config.get('session.name'))
  }
}
