// Adapted from https://github.com/datagovsg/healthsync

import {
  Controller,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Req,
  Res,
} from '@nestjs/common'
import { Request, Response } from 'express'

import { SgidAuthCode } from './dto'
import { MopDto } from 'mops/dto'
import { SgidService } from './sgid.service'
import { MopsService } from 'mops/mops.service'
import { ConfigService } from 'core/providers'
import { MopId } from 'common/decorators'
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new UnauthorizedException(e.message)
      }
      throw e
    }
  }

  @Get('whoami')
  async whoami(@MopId() mopId: number): Promise<MopDto | undefined> {
    if (mopId) {
      const mop = await this.mopsService.getById(mopId)
      if (mop) {
        const { nric } = mop
        return { nric }
      }
    }
    return
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
