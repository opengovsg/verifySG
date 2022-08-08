import { Body, Controller, Post, UseGuards } from '@nestjs/common'

import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { OfficerId } from 'common/decorators'

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
   * @param officerId id of officer creating the call from session
   * @param body contains callScope and nric from frontend
   */
  @UseGuards(AuthOfficerGuard)
  @Post()
  async sendNotification(
    @OfficerId() officerId: number,
    @Body() body: SendNotificationReqDto,
  ): Promise<SendNotificationResDto> {
    return this.notificationsService.sendNotification(officerId, body)
  }
}
