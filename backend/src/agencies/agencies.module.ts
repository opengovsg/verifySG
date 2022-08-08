import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthAdminModule } from 'auth-admin/auth-admin.module'
import { Agency } from 'database/entities'

import { AgenciesController } from './agencies.controller'
import { AgenciesService } from './agencies.service'

@Module({
  imports: [TypeOrmModule.forFeature([Agency]), AuthAdminModule],
  controllers: [AgenciesController],
  providers: [AgenciesService],
  exports: [AgenciesService],
})
export class AgenciesModule {}
