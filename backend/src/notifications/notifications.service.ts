import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { normalizeNric } from '~shared/utils/nric'
import {
  Notification,
  NotificationType,
  ModalityParams,
} from 'database/entities'
import { OfficersService } from 'officers/officers.service'
import {
  generateNewSGNotifyParams,
  sgNotifyParamsStatusToNotificationStatusMapper,
} from './sgnotify/utils'
import { SGNotifyService } from './sgnotify/sgnotify.service'
import {
  SendNotificationReqDto,
  SendNotificationResDto,
} from '~shared/types/api'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private officersService: OfficersService,
    private sgNotifyService: SGNotifyService,
  ) {}

  async findById(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id },
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
    notificationBody: SendNotificationReqDto,
  ): Promise<Notification | null> {
    const { nric } = notificationBody
    const normalizedNric = normalizeNric(nric)
    const officer = await this.officersService.findById(officerId)
    if (!officer) throw new BadRequestException('Officer not found')
    if (!officer.name || !officer.position)
      throw new BadRequestException('Officer must have name and position')
    const { agency } = await this.officersService.mapToDto(officer)
    const { id: agencyShortName, name: agencyName, logoUrl } = agency
    const notificationToAdd = this.notificationRepository.create({
      officer: { id: officerId },
      notificationType: NotificationType.SGNOTIFY,
      recipientId: normalizedNric,
      modalityParams: generateNewSGNotifyParams(
        logoUrl,
        agencyName,
        normalizedNric,
        agencyShortName,
        officer.name,
        officer.position,
      ),
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
    body: SendNotificationReqDto,
  ): Promise<SendNotificationResDto> {
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

  mapToDto(notification: Notification): SendNotificationResDto {
    const { id, officer, createdAt } = notification
    return {
      id,
      createdAt,
      officer: this.officersService.mapToDto(officer),
    }
  }
}
