import { Module } from '@nestjs/common'
import { SgnotifyController } from './sgnotify.controller'
import { SgnotifyService } from './sgnotify.service'

@Module({
  controllers: [SgnotifyController],
  providers: [SgnotifyService],
})
export class SgnotifyModule {}
