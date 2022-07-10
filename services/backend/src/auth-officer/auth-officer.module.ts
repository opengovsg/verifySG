import { Module } from '@nestjs/common'
import { AuthOfficerService } from './auth-officer.service'
import { AuthOfficerController } from './auth-officer.controller'
import { OfficersModule } from 'officers/officers.module'
import { OtpService } from '../otps/otp.service'
import { MailerService } from 'common/providers/mailer.service'
import { AgenciesModule } from 'agencies/agencies.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OTP } from '../database/entities'

@Module({
  imports: [TypeOrmModule.forFeature([OTP]), OfficersModule, AgenciesModule],
  controllers: [AuthOfficerController],
  providers: [AuthOfficerService, OtpService, MailerService],
})
export class AuthOfficerModule {}
