// Adapted from https://github.com/datagovsg/healthsync

import { Module } from '@nestjs/common'

import { SgidService } from './sgid.service'
import { AuthController } from './auth-mop.controller'
import { MopsModule } from 'mops/mops.module'

@Module({
  imports: [MopsModule],
  providers: [SgidService],
  controllers: [AuthController],
})
export class AuthMopModule {}
