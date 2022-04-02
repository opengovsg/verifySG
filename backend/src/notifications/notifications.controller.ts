import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'

import { GetNotificationDto } from 'notifications/dto'
import { OfficerId } from 'common/decorators'
import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'
import { NotificationsService } from './notifications.service'
import { CreateNotificationDto } from './dto'

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Creates new call given an officerId and call body
   * @param officerId id of officer creating the call from session
   * @param body contains callScope and nric from frontend
   */
  @UseGuards(AuthOfficerGuard)
  @Post()
  async createNewNotification(
    @OfficerId() officerId: number,
    @Body() body: CreateNotificationDto,
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
