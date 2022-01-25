// Adapted from https://github.com/datagovsg/healthsync

import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { Request, Response } from 'express'

import { SgidAuthCode } from './dto'
import { MopDto } from 'mops/dto'
import { SgidService } from './sgid.service'
import { MopsService } from 'mops/mops.service'
import { ConfigService } from 'core/providers'
import { AuthMopGuard } from './guards/auth-mop.guard'
import { SgidAuthUrl } from './dto'

@Controller('auth')
export class AuthController {
  constructor(
    private sgidService: SgidService,
    private mopsService: MopsService,
    private config: ConfigService,
  ) {}

  @Get('login')
  getAuthorizationUrl(): SgidAuthUrl {
    const { authUrl } = this.sgidService.createAuthorizationUrl()
    return { authUrl }
  }

  /**
   * prefer to use @Req rather than @Session as req.session exposes
   * custom session data extended in express-session.d.ts
   */
  @Post('login')
  async handleSgidCallback(
    @Body() body: SgidAuthCode,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const mop = await this.sgidService.handleCallback(body)
      const { id } = await this.mopsService.findOrInsert(mop)
      req.session.mopId = id
      console.log('req.session', req.session)
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message)
      }
      throw e
    }
  }

  @UseGuards(AuthMopGuard)
  @Get('whoami')
  getUserInfo(@Res({ passthrough: true }) res: Response): MopDto {
    console.log('whoami success')
    const { nric } = res.locals.mop
    return { nric }
  }

  /**
   * Need to set passthrough to true to allow automatically response handling
   */
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): void {
    req.session.destroy(() => null)
    res.clearCookie(this.config.get('session.name'))
  }
}
