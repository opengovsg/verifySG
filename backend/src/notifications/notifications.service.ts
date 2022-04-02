import axios, { AxiosError, AxiosInstance } from 'axios'
import crypto from 'crypto'
import * as jose from 'jose'
import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import {
  MessageTemplateId,
  Notification,
  NotificationType,
  SGNotifyNotificationStatus,
  SGNotifyParams,
} from 'database/entities'
import {
  CreateNotificationDto,
  GetNotificationDto,
  GetSGNotifyJwksDto,
  PostSGNotifyAuthzDto,
  PostSGNotifyJweDto,
} from './dto'
import { OfficersService } from 'officers/officers.service'
import { ConfigService } from '../core/providers'
import { AuthPayload, NotificationPayload, SGNotifyPayload } from './dto'
import { maskNric } from '../common/utils'
import { SGNotifyParamsStatusToNotificationStatusMapper } from '../common/utils'
import { Logger } from 'core/providers'

@Injectable()
export class NotificationsService {
  private client: AxiosInstance
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private config: ConfigService,
    private officersService: OfficersService,
    private logger: Logger,
  ) {
    const { baseUrl, timeout } = this.config.get('sgNotify')
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
    })
  }

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
    const officer = await this.officersService.findById(officerId)
    if (!officer) throw new BadRequestException('Officer not found')
    const { agency } = await this.officersService.mapToDto(officer)
    const { id: agencyShortName, name: agencyName, logoUrl } = agency
    const notificationToAdd = this.notificationRepository.create({
      officer: { id: officerId },
      notificationType: NotificationType.SGNOTIFY,
      recipientId: nric,
      callScope,
      // TODO: process different message templates programmatically
      sgNotifyParams: {
        agencyLogoUrl: logoUrl,
        senderName: agencyName,
        title: 'Upcoming Phone Call',
        uin: nric,
        shortMessage: `A public officer from ${agencyShortName} will be calling you shortly.`,
        templateId: MessageTemplateId.GENERIC_PHONE_CALL,
        sgNotifyLongMessageParams: {
          agency: agencyShortName,
          officer_name: officer.name,
          position: officer.position,
          masked_nric: `(${maskNric(nric)})`,
          call_details:
            'This call will be made in the next 10 minutes. Please verify the person calling you is indeed a public officer using the name and position provided in this message.',
          callback_details: ' ', // unused for now, but useful for future extension
          status: SGNotifyNotificationStatus.NOT_SENT,
        },
      },
    })
    const addedNotification = await this.notificationRepository.save(
      notificationToAdd,
    )
    return this.findById(addedNotification.id)
  }

  async updateNotification(
    notificationId: number,
    sgNotifyParams: SGNotifyParams,
  ): Promise<Notification> {
    const notificationToUpdate = await this.findById(notificationId)
    if (!notificationToUpdate)
      throw new BadRequestException(`Notification ${notificationId} not found`)
    const notificationStatus =
      SGNotifyParamsStatusToNotificationStatusMapper(sgNotifyParams)
    return await this.notificationRepository.save({
      ...notificationToUpdate,
      status: notificationStatus,
      sgNotifyParams,
    })
  }

  async sendNotification(notificationId: number): Promise<SGNotifyParams> {
    const SGNotifyPublicKey = await this.getPublicKey()
    const ecPrivateKey = await this.getPrivateKey()
    const notificationToSend = await this.findById(notificationId)
    if (!notificationToSend)
      throw new BadRequestException(`Notification ${notificationId} not found`)
    const { sgNotifyParams } = notificationToSend
    const jwe = await this.sendNotificationRequest(
      sgNotifyParams,
      SGNotifyPublicKey,
      ecPrivateKey,
    )
    if (!jwe) {
      this.logger.log({
        message: 'NRIC provided not found',
        ...sgNotifyParams,
      })
      throw new BadRequestException(
        'Unable to send notification as NRIC specified does not have an associated Singpass Mobile app.',
      )
    }
    const notificationPayload = (await this.decodePayload(
      SGNotifyPublicKey,
      ecPrivateKey,
      jwe,
    )) as NotificationPayload
    return {
      ...sgNotifyParams,
      requestId: notificationPayload.request_id,
      sgNotifyLongMessageParams: {
        ...sgNotifyParams.sgNotifyLongMessageParams,
        status: SGNotifyNotificationStatus.SENT_BY_SERVER,
      },
    }
  }

  async sendNotificationRequest(
    sgNotifyParams: SGNotifyParams,
    SGNotifyPublicKey: jose.KeyLike | Uint8Array,
    ecPrivateKey: jose.KeyLike | Uint8Array,
  ): Promise<string | null> {
    const authToken = await this.getAuthToken(SGNotifyPublicKey, ecPrivateKey)
    const jweObject = await this.generateNotificationJWEObject(
      sgNotifyParams,
      SGNotifyPublicKey,
      ecPrivateKey,
    )
    try {
      const { data } = await this.client.post<PostSGNotifyJweDto>(
        'v1/notification/requests',
        {
          jwe: jweObject,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      )
      return data.jwe
    } catch (e) {
      if ((e as AxiosError).response?.status === 404) {
        return null
      }
      throw e
    }
  }

  async getPublicKey(): Promise<jose.KeyLike | Uint8Array> {
    const url = '/.well-known/ntf-authz-keys'
    // TODO: error handling if URL is down for some reason; fall back to hardcoded public key?
    const { data } = await this.client.get<GetSGNotifyJwksDto>(url)
    return await jose.importJWK(data.keys[0], 'ES256')
  }

  async getPrivateKey(): Promise<jose.KeyLike | Uint8Array> {
    const { ecPrivateKey: ecPrivateKeyString, eServiceId } =
      this.config.get('sgNotify')
    const ecPrivateKey = crypto.createPrivateKey(ecPrivateKeyString)
    const ecPrivateKeyJWK = await jose.exportJWK(ecPrivateKey)
    // this update does not affect functionality, but included for adherence to SGNotify's sample code
    const updatedEcPrivateKeyJWK = {
      ...ecPrivateKeyJWK,
      kid: eServiceId, // key ID can be used for user-side key rotation, but SG-Notify is not currently doing key rotation
      use: 'sig', // sig is a legacy thing, can ignore
    }
    return await jose.importJWK(updatedEcPrivateKeyJWK, 'ES256')
  }

  async decodePayload(
    SGNotifyPublicKey: jose.KeyLike | Uint8Array,
    ecPrivateKey: jose.KeyLike | Uint8Array,
    encryptedPayload: string,
  ): Promise<SGNotifyPayload> {
    // TODO: error handling if decryption fails for some reason
    const { plaintext } = await jose.compactDecrypt(
      encryptedPayload,
      ecPrivateKey,
    )
    const signedJWT = new TextDecoder().decode(plaintext)
    const { payload } = await jose.jwtVerify(signedJWT, SGNotifyPublicKey)
    return payload
  }

  async generateAuthJWEObject(
    SGNotifyPublicKey: jose.KeyLike | Uint8Array,
    ecPrivateKey: jose.KeyLike | Uint8Array,
  ): Promise<string> {
    const { clientId, clientSecret, eServiceId } = this.config.get('sgNotify')
    const signedJWT = await new jose.SignJWT({
      client_id: clientId,
      client_secret: clientSecret,
    })
      .setExpirationTime('2m')
      .setProtectedHeader({
        typ: 'JWT',
        alg: 'ES256',
        kid: eServiceId,
      })
      .sign(ecPrivateKey)

    return await new jose.CompactEncrypt(new TextEncoder().encode(signedJWT))
      .setProtectedHeader({
        alg: 'ECDH-ES+A256KW',
        enc: 'A256GCM',
        cty: 'JWT',
      })
      .encrypt(SGNotifyPublicKey)
  }

  async getAuthToken(
    SGNotifyPublicKey: jose.KeyLike | Uint8Array,
    ecPrivateKey: jose.KeyLike | Uint8Array,
  ): Promise<string> {
    const jweObject = await this.generateAuthJWEObject(
      SGNotifyPublicKey,
      ecPrivateKey,
    )
    const { clientId, clientSecret } = this.config.get('sgNotify')
    // TODO error handling if authz request fails
    const { data } = await this.client.post<PostSGNotifyAuthzDto>(
      '/v1/oauth2/token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'CLIENT_CREDENTIALS',
      },
      {
        headers: {
          Authorization: `Bearer ${jweObject}`,
        },
      },
    )
    const authPayload = (await this.decodePayload(
      SGNotifyPublicKey,
      ecPrivateKey,
      data.token,
    )) as AuthPayload
    return authPayload.access_token
  }

  async generateNotificationJWEObject(
    sgNotifyParams: SGNotifyParams,
    SGNotifyPublicKey: jose.KeyLike | Uint8Array,
    ecPrivateKey: jose.KeyLike | Uint8Array,
  ): Promise<string> {
    const eServiceId = this.config.get('sgNotify.eServiceId')
    const {
      agencyLogoUrl,
      senderName,
      templateId,
      sgNotifyLongMessageParams,
      title,
      uin,
    } = sgNotifyParams
    const {
      agency,
      masked_nric,
      officer_name,
      position,
      call_details,
      callback_details,
    } = sgNotifyLongMessageParams
    const signedJWT = await new jose.SignJWT({
      notification_req: {
        category: 'MESSAGES',
        channel_mode: 'SPM',
        delivery: 'IMMEDIATE',
        priority: 'HIGH',
        sender_logo_small: agencyLogoUrl,
        sender_name: senderName,
        template_layout: [
          {
            template_id: templateId,
            template_input: {
              agency,
              masked_nric,
              officer_name,
              position,
              call_details,
              callback_details,
            },
          },
        ],
        title,
        uin,
      },
    })
      .setExpirationTime('2m')
      .setProtectedHeader({
        typ: 'JWT',
        alg: 'ES256',
        kid: eServiceId,
      })
      .sign(ecPrivateKey)

    return await new jose.CompactEncrypt(new TextEncoder().encode(signedJWT))
      .setProtectedHeader({
        alg: 'ECDH-ES+A256KW',
        enc: 'A256GCM',
        cty: 'JWT',
      })
      .encrypt(SGNotifyPublicKey)
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
