import { Module } from '@nestjs/common'
import { PurposesController } from './purposes.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Purpose } from '../database/entities'
import { NotificationsModule } from '../notifications/notifications.module'
import { AgenciesModule } from '../agencies/agencies.module'
import { PurposesService } from './purposes.service'
import { OfficersModule } from '../officers/officers.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Purpose]),
    NotificationsModule,
    AgenciesModule,
    OfficersModule,
  ],
  controllers: [PurposesController],
  providers: [PurposesService],
})
export class PurposesModule {}
