import { Module } from '@nestjs/common'
import { AuthOfficerService } from './auth-officer.service'
import { AuthOfficerController } from './auth-officer.controller'
import { OfficersModule } from 'officers/officers.module'
import { OtpService } from './otp.service'
import { MailerService } from 'common/providers/mailer.service'

@Module({
  imports: [OfficersModule],
  controllers: [AuthOfficerController],
  providers: [AuthOfficerService, OtpService, MailerService],
})
export class AuthOfficerModule {}
