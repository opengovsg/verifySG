import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { UniqueParam } from '../database/entities'
import { UniqueParamService } from '../notifications/unique-params/unique-param.service'

import { CheckController } from './check.controller'

@Module({
  imports: [TypeOrmModule.forFeature([UniqueParam])],
  controllers: [CheckController],
  providers: [UniqueParamService],
})
export class CheckModule {}
