import { Module } from '@nestjs/common'
import { OfficersService } from './officers.service'
import { OfficersController } from './officers.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Officer } from '../database/entities'

@Module({
  imports: [TypeOrmModule.forFeature([Officer])],
  providers: [OfficersService],
  controllers: [OfficersController],
})
export class OfficersModule {}
