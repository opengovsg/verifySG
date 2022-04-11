import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  SGNotifyMessageTemplateId,
  Notification,
  NotificationType,
  SGNotifyNotificationStatus,
  ModalityParams,
} from 'database/entities'
import { GetNotificationDto, SendNotificationDto } from './dto'
import { OfficersService } from 'officers/officers.service'
import {
  maskNric,
  sgNotifyParamsStatusToNotificationStatusMapper,
} from './sgnotify/utils'
import { SGNotifyService } from './sgnotify/sgnotify.service'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private officersService: OfficersService,
    private sgNotifyService: SGNotifyService,
  ) {}

  async findById(id: number): Promise<Notification | undefined> {
    return this.notificationRepository.findOne(id, {
      relations: ['officer', 'officer.agency'],
    })
  }

  /**
   * Create a new notification and insert into database
   * @param officerId officer sending the notification
   * @param notificationBody params for notification (call scope and nric for now)
   * @return created notification if successful, else throw error
   */
  async createNotification(
    officerId: number,
    notificationBody: SendNotificationDto,
  ): Promise<Notification | undefined> {
    const { callScope, nric } = notificationBody
    const officer = await this.officersService.findById(officerId)
    if (!officer) throw new BadRequestException('Officer not found')
    const { agency } = await this.officersService.mapToDto(officer)
    const { id: agencyShortName, name: agencyName, logoUrl } = agency
    const notificationToAdd = this.notificationRepository.create({
      officer: { id: officerId },
      notificationType: NotificationType.SGNOTIFY,
      recipientId: nric,
      callScope,
      // TODO: process different message templates programmatically (part 1/2)
      modalityParams: {
        agencyLogoUrl: logoUrl,
        senderName: agencyName,
        title: 'Upcoming Phone Call',
        uin: nric,
        shortMessage: `A public officer from ${agencyShortName} will be calling you shortly.`,
        templateId: SGNotifyMessageTemplateId.GENERIC_PHONE_CALL,
        sgNotifyLongMessageParams: {
          agency: agencyShortName,
          officer_name: officer.name,
          position: officer.position,
          masked_nric: `(${maskNric(nric)})`,
          call_details:
            'This call will be made in the next 10 minutes. Please verify the person calling you is indeed a public officer using the name and position provided in this message.',
          callback_details: ' ', // unused for now, but useful for future extension; cannot be blank or SGNotify will reject the request
          status: SGNotifyNotificationStatus.NOT_SENT,
        },
      },
    })
    const addedNotification = await this.notificationRepository.save(
      notificationToAdd,
    )
    return this.findById(addedNotification.id)
  }

  /**
   * Update previously created notification.
   * notifications.modalityParams updated directly and notification.status updated using mapper function
   * all other fields in notifications should not change after creation
   * @param notificationId id of notification to update
   * @param modalityParams update existing notifications to reflect these new params
   * @return updated notification if successful, else throw error
   */
  async updateNotification(
    notificationId: number,
    modalityParams: ModalityParams,
  ): Promise<Notification> {
    const notificationToUpdate = await this.findById(notificationId)
    if (!notificationToUpdate)
      throw new BadRequestException(`Notification ${notificationId} not found`)
    // ideally, should check type of notification is indeed SGNotify
    const notificationStatus =
      sgNotifyParamsStatusToNotificationStatusMapper(modalityParams)
    return await this.notificationRepository.save({
      ...notificationToUpdate,
      status: notificationStatus,
      modalityParams,
    })
  }

  /**
   * Counterpart to sendNotification on the controller
   * Insert notification into database, sends notification to user, and updates notification status based on response
   *
   * @param officerId id of officer creating the call from session
   * @param body contains callScope and nric from frontend
   */
  async sendNotification(
    officerId: number,
    body: SendNotificationDto,
  ): Promise<GetNotificationDto> {
    const inserted = await this.createNotification(officerId, body)
    if (!inserted) throw new BadRequestException('Notification not created')
    const modalityParamsUpdated = await this.sgNotifyService.sendNotification(
      inserted,
    )
    const updated = await this.updateNotification(
      inserted.id,
      modalityParamsUpdated,
    )
    return this.mapToDto(updated)
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
