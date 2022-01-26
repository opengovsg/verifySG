import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { OfficerDto } from 'officers/dto'
import { AuthOfficerService } from './auth-officer.service'
import { ConfigService } from 'core/providers'
import { Logger } from 'core/providers'
import { Request, Response } from 'express'

import { AuthOfficerGuard } from './guards/auth-officer.guard'
import { OtpAuthVerify } from './dto/otp-auth-verify'

@Controller('auth-officers')
export class AuthOfficerController {
  constructor(
    private readonly authOfficerService: AuthOfficerService,
    private logger: Logger,
    private config: ConfigService,
  ) {}

  @Post()
  async sendOTP(@Body() body: OfficerDto): Promise<void> {
    const { email } = body
    return await this.authOfficerService.sendOTP(email)
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
      throw new UnauthorizedException()
    }
  }

  @UseGuards(AuthOfficerGuard)
  @Get('whoami')
  async whoami(@Res({ passthrough: true }) res: Response): Promise<OfficerDto> {
    const { email } = res.locals.officer
    return { email }
  }

  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): void {
    req.session.destroy(() => null)
    res.clearCookie(this.config.get('session.name'))
  }
}
