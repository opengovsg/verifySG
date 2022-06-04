import { Module } from '@nestjs/common'
import { PurposesController } from './purposes.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Purpose } from '../database/entities'
import { PurposesService } from './purposes.service'
import { OfficersModule } from '../officers/officers.module'

@Module({
  imports: [TypeOrmModule.forFeature([Purpose]), OfficersModule],
  controllers: [PurposesController],
  providers: [PurposesService],
})
export class PurposesModule {}
