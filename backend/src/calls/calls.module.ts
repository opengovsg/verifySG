import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Call } from 'database/entities'
import { CallsService } from './calls.service'
import { CallsController } from './calls.controller'

import { OfficersModule } from 'officers/officers.module'

@Module({
  imports: [TypeOrmModule.forFeature([Call]), OfficersModule],
  controllers: [CallsController],
  providers: [CallsService],
})
export class CallsModule {}
