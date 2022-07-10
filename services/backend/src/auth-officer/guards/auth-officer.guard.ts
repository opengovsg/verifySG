// Adapted from https://github.com/datagovsg/healthsync

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { OfficersService } from 'officers/officers.service'

@Injectable()
export class AuthOfficerGuard implements CanActivate {
  constructor(private officersService: OfficersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { getRequest, getResponse } = context.switchToHttp()
    const req = getRequest<Request>()
    const res = getResponse<Response>()
    if (req.session.officerId) {
      const officer = await this.officersService.findById(req.session.officerId)
      if (officer) {
        res.locals.officer = officer
        return true
      }
    }
    throw new UnauthorizedException()
  }
}
