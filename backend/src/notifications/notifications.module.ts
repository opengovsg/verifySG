import { Module } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { NotificationsController } from './notifications.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Notification } from '../database/entities'
import { CallsModule } from '../calls/calls.module'

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), CallsModule],
  providers: [NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
