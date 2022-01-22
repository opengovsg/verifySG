// Adapted from https://github.com/datagovsg/healthsync

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { MopsService } from 'mops/mops.service'

@Injectable()
export class AuthMopGuard implements CanActivate {
  constructor(private mopsService: MopsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { getRequest, getResponse } = context.switchToHttp()
    const req = getRequest<Request>()
    const res = getResponse<Response>()
    if (req.session.mopId) {
      const mop = await this.mopsService.getById(req.session.mopId)
      if (mop) {
        res.locals.mop = mop
        return true
      }
    }
    throw new UnauthorizedException()
  }
}
