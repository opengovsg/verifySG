import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { AuthAdminService } from 'auth-admin/auth-admin.service'

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(private authService: AuthAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const adminKey: string | undefined = req.get('Authorization')

    const valid = await this.authService.validateAdminKey(adminKey)
    if (!valid) throw new UnauthorizedException('Admin key is not valid')

    return true
  }
}
