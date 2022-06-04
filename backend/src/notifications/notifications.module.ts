import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Notification, Purpose } from 'database/entities'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { OfficersModule } from 'officers/officers.module'
import { SGNotifyService } from './sgnotify/sgnotify.service'
import { PurposesModule } from '../purposes/purposes.module'
import { PurposesService } from '../purposes/purposes.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Purpose]),
    NotificationsModule,
    OfficersModule,
    PurposesModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, PurposesService, SGNotifyService],
})
export class NotificationsModule {
  constructor(private sgNotifyService: SGNotifyService) {}

  async onModuleInit(): Promise<void> {
    // TODO: need to reinitialize if sendNotification fails consecutively -> outdated public key
    await this.sgNotifyService.initialize()
  }
}
