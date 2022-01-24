import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Call } from 'database/entities'
import { CallsService } from './calls.service'
import { CallsController } from './calls.controller'
import { MopsModule } from 'mops/mops.module'

@Module({
  imports: [TypeOrmModule.forFeature([Call]), MopsModule],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
