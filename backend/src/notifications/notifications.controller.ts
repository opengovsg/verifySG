import { Body, Controller, Post, UseGuards } from '@nestjs/common'

import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'

import { OfficerInfo, OfficerInfoInterface } from '../common/decorators'

import { NotificationsService } from './notifications.service'

import {
  SendNotificationReqDto,
  SendNotificationResDto,
} from '~shared/types/api'

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Endpoint for frontend to call to send a new notification
   */
  @UseGuards(AuthOfficerGuard)
  @Post()
  async sendNotification(
    @OfficerInfo() officerInfo: OfficerInfoInterface,
    @Body() body: SendNotificationReqDto,
  ): Promise<SendNotificationResDto> {
    const { officerId, officerAgency } = officerInfo
    return this.notificationsService.sendNotification(
      officerId,
      officerAgency,
      body,
    )
  }
}
