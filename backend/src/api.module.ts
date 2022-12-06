import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'

import { AgenciesModule } from './agencies/agencies.module'
import { AuthOfficerModule } from './auth-officer/auth-officer.module'
import { EnvModule } from './env/env.module'
import { HealthModule } from './health/health.module'
import { MessageTemplatesModule } from './message-templates/message-templates.module'
import { NotificationsModule } from './notifications/notifications.module'
import { OfficersModule } from './officers/officers.module'
import { CheckModule } from './verify/check.module'

const apiModules = [
  HealthModule,
  EnvModule,
  NotificationsModule,
  OfficersModule,
  AuthOfficerModule,
  AgenciesModule,
  NotificationsModule,
  MessageTemplatesModule,
  CheckModule,
]

@Module({
  imports: [
    ...apiModules,
    RouterModule.register([
      {
        path: 'api/v1',
        children: apiModules,
      },
    ]),
  ],
})
export class ApiModule {}
