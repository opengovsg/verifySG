import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'

import { OfficerId } from 'common/decorators'
import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { NotificationsService } from './notifications.service'
import { SendNewNotificationDto, GetNotificationDto } from './dto'

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Endpoint for frontend to call to send a new notification
   * Insert notification into database, sends notification to user, and updates notification status based on response
   * @param officerId id of officer creating the call from session
   * @param body contains callScope and nric from frontend
   */
  @UseGuards(AuthOfficerGuard)
  @Post()
  async sendNewNotification(
    @OfficerId() officerId: number,
    @Body() body: SendNewNotificationDto,
  ): Promise<GetNotificationDto> {
    const inserted = await this.notificationsService.createNotification(
      officerId,
      body,
    )
    if (!inserted) throw new BadRequestException('Notification not created')
    const sgNotifyParamsUpdated =
      await this.notificationsService.sendNotification(inserted.id)
    const updated = await this.notificationsService.updateNotification(
      inserted.id,
      sgNotifyParamsUpdated,
    )
    return this.notificationsService.mapToDto(updated)
  }
}
