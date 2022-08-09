import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MessageTemplate } from '../database/entities'
import { OfficersModule } from '../officers/officers.module'

import { MessageTemplatesController } from './message-templates.controller'
import { MessageTemplatesService } from './message-templates.service'

@Module({
  imports: [TypeOrmModule.forFeature([MessageTemplate]), OfficersModule],
  controllers: [MessageTemplatesController],
  providers: [MessageTemplatesService],
})
export class MessageTemplatesModule {}
