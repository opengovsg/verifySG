import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AgenciesModule } from 'agencies/agencies.module'

import { Officer } from '../database/entities'

import { OfficersController } from './officers.controller'
import { OfficersService } from './officers.service'

@Module({
  imports: [TypeOrmModule.forFeature([Officer]), AgenciesModule],
  providers: [OfficersService],
  controllers: [OfficersController],
  exports: [OfficersService],
})
export class OfficersModule {}
