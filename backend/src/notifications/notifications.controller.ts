import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'

import { AuthOfficerGuard } from 'auth-officer/guards/auth-officer.guard'

import { OfficerInfo, OfficerInfoInterface } from '../common/decorators'

import { NotificationsService } from './notifications.service'

import {
  MessageTemplateType,
  SendNotificationReqDto,
  SendNotificationReqSGNotifyDto,
  SendNotificationReqSmsDto,
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
    @Body({
      // required because SendNotificationReqDto is a type union, not a class
      transform: async (body: SendNotificationReqDto) => {
        let transformedBody:
          | SendNotificationReqSGNotifyDto
          | SendNotificationReqSmsDto
        switch (body.type) {
          case MessageTemplateType.SMS:
            transformedBody = plainToInstance(SendNotificationReqSmsDto, body)
            break
          case MessageTemplateType.SGNOTIFY:
            transformedBody = plainToInstance(
              SendNotificationReqSGNotifyDto,
              body,
            )
            break
          default:
            throw new Error('Invalid send notification request body')
        }
        const validationErrors = await validate(transformedBody)
        if (validationErrors.length > 0) {
          // show validation error to caller; not sure whether to log
          // should never happen because frontend would have validated
          throw new BadRequestException(
            JSON.stringify(validationErrors[0].constraints),
          )
        }
        return transformedBody
      },
    })
    body: SendNotificationReqDto,
  ): Promise<SendNotificationResDto> {
    const { officerId, officerAgency } = officerInfo
    return this.notificationsService.sendNotification(
      officerId,
      officerAgency,
      body,
    )
  }
}
