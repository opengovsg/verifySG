import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Mop } from 'database/entities/mop.entity'
import { MopsService } from './mops.service'

@Module({
  imports: [TypeOrmModule.forFeature([Mop])],
  providers: [MopsService],
  exports: [MopsService],
})
export class MopsModule {}
