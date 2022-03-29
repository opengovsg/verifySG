import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  Notification,
  NotificationStatus,
  NotificationType,
} from 'database/entities'
import { CreateNotificationDto, GetNotificationDto } from './dto'
import { OfficersService } from 'officers/officers.service'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private officersService: OfficersService,
  ) {}

  async findById(id: number): Promise<Notification | undefined> {
    return this.notificationRepository.findOne(id, {
      relations: ['officer', 'officer.agency'],
    })
  }

  async createNotification(
    officerId: number,
    notificationBody: CreateNotificationDto,
  ): Promise<Notification | undefined> {
    const { callScope, nric } = notificationBody
    const notificationToAdd = this.notificationRepository.create({
      officer: { id: officerId },
      notificationType: NotificationType.SGNOTIFY,
      recipientId: nric,
      status: NotificationStatus.NOT_SENT,
      callScope,
      sgNotifyParams: {
        agencyLogoUrl: '',
        senderName: '',
        title: '',
        uin: '',
        shortMessage: '',
        templateId: '',
        sgNotifyLongMessageParams: {
          param1: '',
          param2: '',
        },
      },
    })
    const addedNotification = await this.notificationRepository.save(
      notificationToAdd,
    )
    return this.findById(addedNotification.id)
  }

  mapToDto(notification: Notification): GetNotificationDto {
    const { id, officer, createdAt, callScope } = notification
    return {
      id,
      createdAt,
      callScope,
      officer: this.officersService.mapToDto(officer),
    }
  }
}
