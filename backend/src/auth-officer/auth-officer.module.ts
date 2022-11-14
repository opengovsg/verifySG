import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AgenciesModule } from 'agencies/agencies.module'
import { MailerService } from 'common/providers/mailer.service'
import { OfficersModule } from 'officers/officers.module'

import { OTP } from '../database/entities'

import { OtpService } from './otps/otp.service'
import { AuthOfficerController } from './auth-officer.controller'
import { AuthOfficerService } from './auth-officer.service'

@Module({
  imports: [TypeOrmModule.forFeature([OTP]), OfficersModule, AgenciesModule],
  controllers: [AuthOfficerController],
  providers: [AuthOfficerService, OtpService, MailerService],
})
export class AuthOfficerModule {}
