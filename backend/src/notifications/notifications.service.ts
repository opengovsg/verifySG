import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ModalityParams, Notification } from 'database/entities'
import { OfficersService } from 'officers/officers.service'

import { Logger } from '../core/providers'
import { MessageTemplatesService } from '../message-templates/message-templates.service'

import { SGNotifyService } from './sgnotify/sgnotify.service'
import {
  generateNewSGNotifyParams,
  SGNotifyParams,
  sgNotifyParamsStatusToNotificationStatusMapper,
} from './sgnotify/utils'
import {
  INVALID_MESSAGE_TEMPLATE,
  NOTIFICATION_REQUEST_ERROR_MESSAGE,
  OFFICER_MISSING_FIELDS,
  OFFICER_NOT_FOUND,
} from './constants'

import {
  SendNotificationReqDto,
  SendNotificationResDto,
  SGNotifyMessageTemplateParams,
} from '~shared/types/api'
import { normalizeNric } from '~shared/utils/nric'

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private messageTemplatesService: MessageTemplatesService,
    private officersService: OfficersService,
    private sgNotifyService: SGNotifyService,
    private logger: Logger,
  ) {}

  async findById(id: number): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id },
      relations: ['officer', 'officer.agency', 'messageTemplate'],
    })
  }

  /**
   * Create a new notification and insert into database
   * @param officerId officer sending the notification from session
   * @param officerAgency agency of officer sending the notification from session
   * @param notificationBody params for notification (call scope and nric for now)
   * @return created notification if successful, else throw error
   */
  async createNotification(
    officerId: number,
    officerAgency: string,
    notificationBody: SendNotificationReqDto,
  ): Promise<Notification | null> {
    const { msgTemplateKey, nric } = notificationBody
    const isMessageTemplateValid =
      await this.messageTemplatesService.isMessageTemplateValidByAgencyId(
        msgTemplateKey,
        officerAgency,
      )
    if (!isMessageTemplateValid)
      // either message template does not exist OR belongs to a different agency
      throw new BadRequestException(INVALID_MESSAGE_TEMPLATE)
    const officer = await this.officersService.findById(officerId)
    if (!officer) throw new BadRequestException(OFFICER_NOT_FOUND)
    if (!officer.name || !officer.position)
      throw new BadRequestException(OFFICER_MISSING_FIELDS)
    const normalizedNric = normalizeNric(nric)
    const { agency } = await this.officersService.mapToDto(officer)
    const { id: agencyShortName, name: agencyName, logoUrl } = agency
    const { id: messageTemplateId, params } =
      await this.messageTemplatesService.getMessageTemplateParams(
        msgTemplateKey,
      )
    const notificationToAdd = this.notificationRepository.create({
      officer: { id: officerId },
      messageTemplate: { id: messageTemplateId },
      recipientId: normalizedNric,
      modalityParams: await generateNewSGNotifyParams(
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
        params as SGNotifyMessageTemplateParams,
      ).catch((e) => {
        this.logger.error(
          `Internal server error when converting notification params to SGNotify request payload.\nError: ${e}`,
        )
        throw new BadRequestException(NOTIFICATION_REQUEST_ERROR_MESSAGE)
      }),
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
    const notificationStatus = sgNotifyParamsStatusToNotificationStatusMapper(
      modalityParams as SGNotifyParams, // TODO: temporary cast to SGNotifyParams
    )
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
   * @param officerAgency agency of officer sending the notification from session
   * @param body contains callScope and nric from frontend
   */
  async sendNotification(
    officerId: number,
    officerAgency: string,
    body: SendNotificationReqDto,
  ): Promise<SendNotificationResDto> {
    const inserted = await this.createNotification(
      officerId,
      officerAgency,
      body,
    )
    if (!inserted) throw new BadRequestException('Notification not created')
    const modalityParamsUpdated = await this.sgNotifyService.sendNotification(
      inserted.modalityParams as SGNotifyParams, // TODO: temporary cast to SGNotifyParams
    )
    const updated = await this.updateNotification(
      inserted.id,
      modalityParamsUpdated,
    )
    return this.mapToDto(updated)
  }

  mapToDto(notification: Notification): SendNotificationResDto {
    const { officer, createdAt, messageTemplate } = notification
    return {
      createdAt,
      messageTemplate:
        this.messageTemplatesService.mapToResDto(messageTemplate),
      officer: this.officersService.mapToDto(officer),
    }
  }
}
