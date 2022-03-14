import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AgenciesService } from './agencies.service'
import { AgenciesController } from './agencies.controller'

import { Agency } from 'database/entities'
import { AuthAdminModule } from 'auth-admin/auth-admin.module'

@Module({
  imports: [TypeOrmModule.forFeature([Agency]), AuthAdminModule],
  controllers: [AgenciesController],
  providers: [AgenciesService],
  exports: [AgenciesService],
})
export class AgenciesModule {}
