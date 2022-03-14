import { Module } from '@nestjs/common'
import { OfficersService } from './officers.service'
import { OfficersController } from './officers.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Officer } from '../database/entities'
import { AgenciesModule } from 'agencies/agencies.module'

@Module({
  imports: [TypeOrmModule.forFeature([Officer]), AgenciesModule],
  providers: [OfficersService],
  controllers: [OfficersController],
  exports: [OfficersService],
})
export class OfficersModule {}
