import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Call } from 'database/entities'
import { CallsService } from './calls.service'
import { CallsController } from './calls.controller'
import { MopsModule } from 'mops/mops.module'
import { CallGateway } from './call.gateway'
import { OfficersModule } from 'officers/officers.module'

@Module({
  imports: [TypeOrmModule.forFeature([Call]), MopsModule, OfficersModule],
  controllers: [CallsController],
  providers: [CallsService, CallGateway],
})
export class CallsModule {}
