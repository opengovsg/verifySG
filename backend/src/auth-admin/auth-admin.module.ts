import { Module } from '@nestjs/common'
import { KeyHashService } from 'common/providers/key-hash.service'

import { AuthAdminService } from './auth-admin.service'

@Module({
  providers: [AuthAdminService, KeyHashService],
  exports: [AuthAdminService],
})
export class AuthAdminModule {}
