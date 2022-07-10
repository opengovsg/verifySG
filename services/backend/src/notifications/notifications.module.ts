import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Notification } from 'database/entities'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { OfficersModule } from 'officers/officers.module'
import { SGNotifyService } from './sgnotify/sgnotify.service'

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), OfficersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, SGNotifyService],
})
export class NotificationsModule {
  constructor(private sgNotifyService: SGNotifyService) {}

  async onModuleInit(): Promise<void> {
    // TODO: need to reinitialize if sendNotification fails consecutively -> outdated public key
    await this.sgNotifyService.initialize()
  }
}
