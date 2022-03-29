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
   * @param body: CreateNotificationDto
   * @returns GetNotificationDto
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
    if (!inserted) throw new BadRequestException('Call not created')
    return this.notificationsService.mapToDto(inserted)
  }
}
