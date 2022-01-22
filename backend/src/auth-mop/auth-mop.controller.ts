// Adapted from https://github.com/datagovsg/healthsync

import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
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

@Controller('auth')
export class AuthController {
  constructor(
    private sgidService: SgidService,
    private mopsService: MopsService,
    private config: ConfigService,
  ) {}

  @Get('login')
  getAuthorizationUrl(@Req() req: Request): {
    authUrl: string
  } {
    const authUrl = this.sgidService.createAuthorizationUrl(req.session.id)
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
    const { code, state } = body
    try {
      const mopData = await this.sgidService.handleCallback(
        code,
        state,
        req.session.id,
      )
      const { id } = await this.mopsService.findOrInsert(mopData)
      req.session.mopId = id
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new HttpException(e.message, HttpStatus.UNAUTHORIZED)
      }
      throw e
    }
  }

  @UseGuards(AuthMopGuard)
  @Get('whoami')
  getMopInfo(@Res({ passthrough: true }) res: Response): MopDto {
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
