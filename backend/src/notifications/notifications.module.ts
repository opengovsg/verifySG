import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Notification } from 'database/entities'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'

import { OfficersModule } from 'officers/officers.module'

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), OfficersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
