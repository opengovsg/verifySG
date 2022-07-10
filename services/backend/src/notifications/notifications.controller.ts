import { Controller, Post, Body, UseGuards } from '@nestjs/common'

import { OfficerId } from 'common/decorators'
import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { NotificationsService } from './notifications.service'
import { SendNotificationDto, SendNotificationResponseDto } from './dto'

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
    @Body() body: SendNotificationDto,
  ): Promise<SendNotificationResponseDto> {
    return this.notificationsService.sendNotification(officerId, body)
  }
}
