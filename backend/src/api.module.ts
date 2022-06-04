import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'

import { HealthModule } from './health/health.module'
import { NotificationsModule } from './notifications/notifications.module'
import { OfficersModule } from './officers/officers.module'
import { AuthOfficerModule } from './auth-officer/auth-officer.module'
import { AgenciesModule } from './agencies/agencies.module'
import { SentryModule } from './sentry/sentry.module'
import { PurposesModule } from './purposes/purposes.module'

const apiModules = [
  HealthModule,
  SentryModule,
  NotificationsModule,
  OfficersModule,
  AuthOfficerModule,
  AgenciesModule,
  NotificationsModule,
  PurposesModule,
]

@Module({
  imports: [
    ...apiModules,
    RouterModule.register([
      {
        path: 'api',
        children: apiModules,
      },
    ]),
  ],
})
export class ApiModule {}
