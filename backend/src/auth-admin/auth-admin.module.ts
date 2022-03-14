import { Module } from '@nestjs/common'

import { AuthAdminService } from './auth-admin.service'

@Module({
  providers: [AuthAdminService],
  exports: [AuthAdminService],
})
export class AuthAdminModule {}
