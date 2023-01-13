import { BadRequestException, Inject } from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  MessageTemplate,
  ModalityParams,
  Notification,
  NotificationStatus,
  Officer,
} from 'database/entities'

import { Logger } from '../core/providers'
import { MessageTemplatesService } from '../message-templates/message-templates.service'
import { OfficersService } from '../officers/officers.service'

import { SGNotifyService } from './sgnotify/sgnotify.service'
import {
  generateNewSGNotifyParams,
  SGNotifyNotificationStatus,
  SGNotifyParams,
} from './sgnotify/utils'
import { SMSParams, SMSService, supportedAgencies } from './sms/sms.service'
import { UniqueParamService } from './unique-params/unique-param.service'
import {
  INVALID_MESSAGE_TEMPLATE,
  NOTIFICATION_REQUEST_ERROR_MESSAGE,
  OFFICER_MISSING_FIELDS,
  OFFICER_NOT_FOUND,
} from './constants'

import {
  MessageTemplateType,
  SendNotificationReqSGNotifyDto,
  SendNotificationReqSmsDto,
  SendNotificationResDto,
  SGNotifyMessageTemplateParams,
  SmsMessageTemplateParams,
} from '~shared/types/api'
import { normalizeNric } from '~shared/utils/nric'

type BodyType<
  TParams extends SmsMessageTemplateParams | SGNotifyMessageTemplateParams,
> = TParams extends SmsMessageTemplateParams
  ? SendNotificationReqSmsDto
  : SendNotificationReqSGNotifyDto

type ModalityParamsType<
  TParams extends SmsMessageTemplateParams | SGNotifyMessageTemplateParams,
> = TParams extends SmsMessageTemplateParams ? SMSParams : SGNotifyParams

export abstract class NotificationsService<
  TParams extends SmsMessageTemplateParams | SGNotifyMessageTemplateParams,
> {
  protected constructor(
    @InjectRepository(Notification)
    protected notificationRepository: Repository<Notification>,
    @Inject(MessageTemplatesService)
    protected messageTemplatesService: MessageTemplatesService,
    @Inject(OfficersService)
    protected officersService: OfficersService,
    @Inject(Logger)
    protected logger: Logger,
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
    notificationBody: BodyType<TParams>,
  ): Promise<Notification> {
    const { msgTemplateKey } = notificationBody
    const { officer, messageTemplate } =
      await this.validateCreateNotificationParams(
        officerId,
        officerAgency,
        msgTemplateKey,
      )
    const { agency } = await this.officersService.mapToDto(officer)
    const { id: agencyShortName, name: agencyName, logoUrl } = agency
    const { id: messageTemplateId, params } = messageTemplate
    const { modalityParams, recipientId } = await this.generateModalityParams({
      officer,
      agencyName,
      agencyShortName,
      notificationBody,
      params: params as TParams, // TODO remove this with type guard
      logoUrl,
    })
    const notificationToAdd = this.notificationRepository.create({
      officer: { id: officerId },
      messageTemplate: { id: messageTemplateId },
      recipientId,
      modalityParams,
    })
    const addedNotification = await this.notificationRepository.save(
      notificationToAdd,
    )
    const notification = await this.findById(addedNotification.id)
    if (!notification) {
      throw new InternalServerErrorException('Notification not created')
    }
    return notification
  }

  protected abstract generateModalityParams({
    officer,
    agencyName,
    agencyShortName,
    notificationBody,
    params,
    logoUrl,
  }: {
    officer: Officer
    agencyName: string
    agencyShortName: string
    notificationBody: BodyType<TParams>
    params: TParams
    logoUrl: string
  }): Promise<{
    modalityParams: ModalityParamsType<TParams>
    recipientId: string
  }>

  // return officer and messageTemplate to save db call
  async validateCreateNotificationParams(
    officerId: number,
    officerAgency: string,
    msgTemplateKey: string,
  ): Promise<{ officer: Officer; messageTemplate: MessageTemplate }> {
    const messageTemplate =
      await this.messageTemplatesService.getMessageTemplateByAgencyId(
        msgTemplateKey,
        officerAgency,
      )
    if (!messageTemplate) {
      // either message template does not exist OR belongs to a different agency
      throw new BadRequestException(INVALID_MESSAGE_TEMPLATE)
    }
    const officer = await this.officersService.findById(officerId)
    if (!officer) throw new BadRequestException(OFFICER_NOT_FOUND)
    if (!officer.name || !officer.position)
      throw new BadRequestException(OFFICER_MISSING_FIELDS)
    return { officer, messageTemplate }
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
    const status = paramsStatusToNotificationStatusMapper(modalityParams)
    return await this.notificationRepository.save({
      ...notificationToUpdate,
      status,
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
    body: BodyType<TParams>,
  ): Promise<SendNotificationResDto> {
    const inserted = await this.createNotification(
      officerId,
      officerAgency,
      body,
    )
    const modalityParamsUpdated = await this.transportNotification(
      officerAgency,
      inserted.modalityParams as ModalityParamsType<TParams>, // TODO: use type guard to remove this cast
    )
    const updated = await this.updateNotification(
      inserted.id,
      modalityParamsUpdated,
    )
    return this.mapToDto(updated)
  }

  protected abstract transportNotification(
    officerAgency: string,
    modalityParams: ModalityParamsType<TParams>,
  ): Promise<ModalityParamsType<TParams>>

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

export class SMSNotificationService extends NotificationsService<SmsMessageTemplateParams> {
  constructor(
    @InjectRepository(Notification)
    protected notificationRepository: Repository<Notification>,
    @Inject(MessageTemplatesService)
    protected messageTemplatesService: MessageTemplatesService,
    @Inject(OfficersService)
    protected officersService: OfficersService,
    @Inject(Logger)
    protected logger: Logger,
    @Inject(SMSService)
    private smsService: SMSService,
    @Inject(UniqueParamService)
    private uniqueParamService: UniqueParamService,
  ) {
    super(
      notificationRepository,
      messageTemplatesService,
      officersService,
      logger,
    )
  }

  protected async generateModalityParams({
    officer,
    agencyName,
    agencyShortName,
    notificationBody,
    params,
  }: {
    officer: Officer
    agencyName: string
    agencyShortName: string
    notificationBody: SendNotificationReqSmsDto
    params: SmsMessageTemplateParams
    logoUrl: string
  }): Promise<{ modalityParams: SMSParams; recipientId: string }> {
    const recipientId = notificationBody.recipientPhoneNumber
    const uniqueParamString = await this.uniqueParamService.generateUniqueParam(
      {
        messageType: MessageTemplateType.SMS,
        agencyName,
        agencySenderId: this.smsService.getAgencySenderId(agencyShortName),
        recipientId,
        timestamp: new Date(),
      },
    ) // use default expiry period for now
    return {
      modalityParams: await this.smsService.generateSMSParamsByTemplate(
        recipientId,
        {
          agencyShortName,
          agencyName,
        },
        {
          officerName: officer.name,
          officerPosition: officer.position,
        },
        params,
        uniqueParamString,
      ),
      recipientId,
    }
  }

  protected async transportNotification(
    officerAgency: string,
    modalityParams: SMSParams,
  ): Promise<SMSParams> {
    // check to make sure agency is supported first before attempting to send
    // i.e. we have Twilio credentials for this agency
    // TODO: remove and manage agency credentials via db
    if (!supportedAgencies.includes(officerAgency)) {
      throw new BadRequestException(
        `Currently we do not support sending SMSes for ${officerAgency}.`,
      )
    }
    return await this.smsService.sendSMS(officerAgency, modalityParams)
  }
}

export class SGNotifyNotificationsService extends NotificationsService<SGNotifyMessageTemplateParams> {
  constructor(
    @InjectRepository(Notification)
    protected notificationRepository: Repository<Notification>,
    @Inject(MessageTemplatesService)
    protected messageTemplatesService: MessageTemplatesService,
    @Inject(OfficersService)
    protected officersService: OfficersService,
    @Inject(Logger)
    protected logger: Logger,
    @Inject(SGNotifyService)
    private sgNotifyService: SGNotifyService,
  ) {
    super(
      notificationRepository,
      messageTemplatesService,
      officersService,
      logger,
    )
  }

  public async generateModalityParams({
    officer,
    agencyName,
    agencyShortName,
    notificationBody,
    params,
    logoUrl,
  }: {
    officer: Officer
    agencyName: string
    agencyShortName: string
    notificationBody: SendNotificationReqSGNotifyDto
    params: SGNotifyMessageTemplateParams
    logoUrl: string
  }): Promise<{ modalityParams: SGNotifyParams; recipientId: string }> {
    const recipientId = normalizeNric(notificationBody.nric)
    const modalityParams = await generateNewSGNotifyParams(
      recipientId,
      {
        agencyShortName,
        agencyName,
        agencyLogoUrl: logoUrl,
      },
      {
        officerName: officer.name,
        officerPosition: officer.position,
      },
      params,
    ).catch((e) => {
      this.logger.error(
        `Internal server error when converting notification params to SGNotify request payload.\nError: ${e}`,
      )
      throw new BadRequestException(NOTIFICATION_REQUEST_ERROR_MESSAGE)
    })
    return { recipientId, modalityParams }
  }

  protected async transportNotification(
    _officerAgency: string,
    modalityParams: SGNotifyParams,
  ): Promise<SGNotifyParams> {
    return await this.sgNotifyService.sendNotification(modalityParams)
  }
}

const paramsStatusToNotificationStatusMapper = (
  params: ModalityParams,
): NotificationStatus => {
  return params.status === SGNotifyNotificationStatus.NOT_SENT ||
    params.status === null
    ? NotificationStatus.NOT_SENT
    : NotificationStatus.SENT
}
