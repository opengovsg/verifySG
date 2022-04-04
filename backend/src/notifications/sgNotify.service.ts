import axios, { AxiosError, AxiosInstance } from 'axios'
import crypto from 'crypto'
import * as jose from 'jose'
import { BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
  Notification,
  SGNotifyNotificationStatus,
  SGNotifyParams,
} from 'database/entities'
import {
  GetSGNotifyJwksDto,
  PostSGNotifyAuthzDto,
  PostSGNotifyJweDto,
} from './dto'
import { ConfigService } from '../core/providers'
import { AuthPayload, NotificationPayload, SGNotifyPayload } from './dto'
import { Logger } from 'core/providers'
import { ConfigSchema } from 'core/config.schema'

export class SgNotifyService {
  private client: AxiosInstance
  private SGNotifyPublicKey: Uint8Array | jose.KeyLike
  private ecPrivateKey: Uint8Array | jose.KeyLike
  private config: ConfigSchema['sgNotify']

  constructor(
    @InjectRepository(Notification)
    private configService: ConfigService,
    private logger: Logger,
  ) {
    this.config = this.configService.get('sgNotify')
  }

  async initialize(): Promise<undefined> {
    const { baseUrl, timeout } = this.config
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
    })

    this.SGNotifyPublicKey = await this.getPublicKey()
    this.ecPrivateKey = await this.getPrivateKey()

    return
  }

  /**
   * Function that gets public key from SGNotify discovery endpoint and returns it as a JWK
   */
  async getPublicKey(): Promise<jose.KeyLike | Uint8Array> {
    const url = '/.well-known/ntf-authz-keys'
    // TODO: error handling if URL is down for some reason; fall back to hardcoded public key?
    const { data } = await this.client.get<GetSGNotifyJwksDto>(url)
    return await jose.importJWK(data.keys[0], 'ES256')
  }

  /**
   * Function that gets private key from config schema and return it as JWK
   */
  async getPrivateKey(): Promise<jose.KeyLike | Uint8Array> {
    const { ecPrivateKey: ecPrivateKeyString, eServiceId } = this.config
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

  /**
   * Send notification to SGNotify API
   * Throws error if SGNotify API says user not found
   * Returns sgNotifyParams (to facilitate database update)
   * @param notification notification to send
   */
  async sendNotification(notification: Notification): Promise<SGNotifyParams> {
    const { sgNotifyParams } = notification
    const authToken = await this.getAuthzToken()
    const jweObject = await this.signAndEncryptPayload(
      this.hydrateSgNotifyTemplate(sgNotifyParams),
    )
    try {
      const {
        data: { jwe },
      } = await this.client.post<PostSGNotifyJweDto>(
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
      const notificationPayload = (await this.decodeAndVerifyPayload(
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
    } catch (e) {
      if ((e as AxiosError).response?.status === 404) {
        this.logger.log({
          message: 'NRIC provided not found',
          ...sgNotifyParams,
        })
        throw new BadRequestException(
          'Unable to send notification as NRIC specified does not have an associated Singpass Mobile app.', // displayed on frontend
        )
      }
      throw e
    }
  }

  /**
   * decode encrypted payloads from SGNotify endpoint (used in both authz and notification endpoints)
   * @return custom SGNotifyPayload that specifies the decrypted payload's shape
   */
  async decodeAndVerifyPayload(
    encryptedPayload: string,
  ): Promise<SGNotifyPayload> {
    // TODO: error handling if decryption fails for some reason
    const { plaintext } = await jose.compactDecrypt(
      encryptedPayload,
      this.ecPrivateKey,
    )
    const signedJWT = new TextDecoder().decode(plaintext)
    const { payload } = await jose.jwtVerify(signedJWT, this.SGNotifyPublicKey)
    return payload
  }

  /**
   * sign and encode payloads to be sent to SGNotify endpoint (used in both authz and notification endpoints)
   * @return custom encrypted JWE object
   */
  async signAndEncryptPayload(payload: any): Promise<string> {
    const { eServiceId } = this.config
    const signedJWT = await new jose.SignJWT(payload)
      .setExpirationTime('2m')
      .setProtectedHeader({
        typ: 'JWT',
        alg: 'ES256',
        kid: eServiceId,
      })
      .sign(this.ecPrivateKey)

    return await new jose.CompactEncrypt(new TextEncoder().encode(signedJWT))
      .setProtectedHeader({
        alg: 'ECDH-ES+A256KW',
        enc: 'A256GCM',
        cty: 'JWT',
      })
      .encrypt(this.SGNotifyPublicKey)
  }

  /**
   * Get authz token from SG-Notify endpoint
   * @return decrypted authz token
   */
  async getAuthzToken(): Promise<string> {
    const { clientId, clientSecret } = this.config
    const authJweObject = await this.signAndEncryptPayload({
      client_id: clientId,
      client_secret: clientSecret,
    })
    const { data } = await this.client.post<PostSGNotifyAuthzDto>(
      '/v1/oauth2/token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'CLIENT_CREDENTIALS',
      },
      {
        headers: {
          Authorization: `Bearer ${authJweObject}`,
        },
      },
    )
    const authPayload = (await this.decodeAndVerifyPayload(
      data.token,
    )) as AuthPayload
    return authPayload.access_token
  }

  // TODO: move into a separate sgNotify.template.service.ts
  hydrateSgNotifyTemplate(sgNotifyParams: SGNotifyParams): any {
    const {
      agencyLogoUrl,
      senderName,
      templateId,
      sgNotifyLongMessageParams,
      title,
      uin,
    } = sgNotifyParams
    // TODO: process different message templates programmatically (part 2)
    const {
      agency,
      masked_nric,
      officer_name,
      position,
      call_details,
      callback_details,
    } = sgNotifyLongMessageParams
    return {
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
    }
  }
}
