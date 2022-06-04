import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  Notification,
  NotificationType,
  ModalityParams,
  Officer,
} from 'database/entities'
import { SendNotificationResponseDto, SendNotificationDto } from './dto'
import { OfficersService } from 'officers/officers.service'
import {
  generateNewSGNotifyParams,
  normalizeNric,
  sgNotifyParamsStatusToNotificationStatusMapper,
} from './sgnotify/utils'
import { PurposesService } from '../purposes/purposes.service'
import { SGNotifyService } from './sgnotify/sgnotify.service'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private officersService: OfficersService,
    private purposesService: PurposesService,
    private sgNotifyService: SGNotifyService,
  ) {}

  async findById(id: number): Promise<Notification | undefined> {
    return this.notificationRepository.findOne(id, {
      relations: ['officer', 'officer.agency', 'purpose'],
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
    const officer = await this.validateCreateNotificationArgs(
      officerId,
      notificationBody,
    )
    const { purposeId, nric } = notificationBody
    const normalizedNric = normalizeNric(nric)
    const { agency } = await this.officersService.mapToDto(officer)
    const { id: agencyShortName, name: agencyName, logoUrl } = agency
    const templateParams = await this.purposesService.getSGNotifyTemplateParams(
      purposeId,
    )
    const notificationToAdd = this.notificationRepository.create({
      officer: { id: officerId },
      purpose: { purposeId },
      notificationType: NotificationType.SGNOTIFY,
      recipientId: normalizedNric,
      modalityParams: generateNewSGNotifyParams(
        normalizedNric,
        {
          agencyShortName,
          agencyName,
          agencyLogoUrl: logoUrl,
        },
        {
          officerName: officer.name,
          officerPosition: officer.position,
        },
        templateParams,
      ),
    })
    const addedNotification = await this.notificationRepository.save(
      notificationToAdd,
    )
    return this.findById(addedNotification.id)
  }
  // return Officer to save one db query
  async validateCreateNotificationArgs(
    officerId: number,
    notificationBody: SendNotificationDto,
  ): Promise<Officer> {
    const { purposeId } = notificationBody
    const officer = await this.officersService.findById(officerId)
    if (!officer) throw new BadRequestException('Officer not found')
    const { agency } = await this.officersService.mapToDto(officer)
    const { id: agencyId } = agency
    const purposeIdValid =
      await this.purposesService.getPurposeValidityByAgencyId(
        purposeId,
        agencyId,
      )
    if (!purposeIdValid) {
      // either purposeId does not exist OR belongs to a different agency
      throw new BadRequestException('Purpose ID not valid')
    }
    return officer
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
  ): Promise<SendNotificationResponseDto> {
    const inserted = await this.createNotification(officerId, body)
    if (!inserted)
      throw new BadRequestException(
        'An error has occurred in NotificationsService.createNotification',
      )
    const modalityParamsUpdated = await this.sgNotifyService.sendNotification(
      inserted,
    )
    const updated = await this.updateNotification(
      inserted.id,
      modalityParamsUpdated,
    )
    return this.mapToDto(updated)
  }

  mapToDto(notification: Notification): SendNotificationResponseDto {
    const { id, officer, createdAt, purpose } = notification
    return {
      id,
      createdAt,
      officer: this.officersService.mapToDto(officer),
      purpose: this.purposesService.mapToDto(purpose),
    }
  }
}
