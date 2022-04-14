import axios, { AxiosError, AxiosInstance } from 'axios'
import crypto from 'crypto'
import * as jose from 'jose'
import { JWTPayload } from 'jose'
import { BadRequestException, Injectable } from '@nestjs/common'

import { ConfigService, Logger } from '../../core/providers'
import { ConfigSchema } from '../../core/config.schema'
import {
  Notification,
  SGNotifyMessageTemplateId,
  SGNotifyNotificationStatus,
} from '../../database/entities'
import {
  AuthPayload,
  GetSGNotifyJwksDto,
  NotificationPayload,
  PostSGNotifyAuthzDto,
  PostSGNotifyJweDto,
  SGNotifyPayload,
} from './dto'
import { insertECPrivateKeyHeaderAndFooter } from './utils'

export interface SGNotifyParams {
  agencyLogoUrl: string
  senderName: string
  title: string
  uin: string // NRIC
  shortMessage: string
  templateId: SGNotifyMessageTemplateId
  sgNotifyLongMessageParams: Record<string, string>
  status: SGNotifyNotificationStatus
  requestId?: string
}

export type Key = Uint8Array | jose.KeyLike

@Injectable()
export class SGNotifyService {
  private client: AxiosInstance
  private SGNotifyPublicKeySig: Key
  private SGNotifyPublicKeyEnc: Key
  private ecPrivateKey: Key
  private readonly config: ConfigSchema['sgNotify']

  constructor(private configService: ConfigService, private logger: Logger) {
    this.config = this.configService.get('sgNotify')
  }

  async initialize(): Promise<void> {
    const { baseUrl, timeout } = this.config
    this.client = axios.create({
      baseURL: baseUrl,
      timeout,
    })
    const [SGNotifyPublicKeySig, SGNotifyPublicKeyEnc] =
      await this.getPublicKeysSigEnc()
    this.SGNotifyPublicKeySig = SGNotifyPublicKeySig
    this.SGNotifyPublicKeyEnc = SGNotifyPublicKeyEnc
    this.ecPrivateKey = await this.getPrivateKey()
  }

  /**
   * Function that gets public key from SGNotify discovery endpoint and returns it as a JWK
   */
  async getPublicKeysSigEnc(): Promise<[Key, Key]> {
    const url = '/.well-known/ntf-authz-keys'
    // TODO: error handling if URL is down for some reason; fall back to hardcoded public key?
    const { data } = await this.client.get<GetSGNotifyJwksDto>(url)
    const publicKeySig = await jose.importJWK(
      data.keys.filter((key) => key.use === 'sig')[0],
      'ES256',
    )
    const publicKeyEnc = await jose.importJWK(
      data.keys.filter((key) => key.use === 'enc')[0],
      'ES256',
    )
    return [publicKeySig, publicKeyEnc]
  }

  /**
   * Function that gets private key from config schema and return it as JWK
   */
  async getPrivateKey(): Promise<Key> {
    const { ecPrivateKey: ecPrivateKeyString, eServiceId } = this.config
    const ecPrivateKey = crypto.createPrivateKey(
      insertECPrivateKeyHeaderAndFooter(ecPrivateKeyString),
    )

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
   * sends notification by calling SGNotify authz and notification endpoints
   */
  async sendNotification(notification: Notification): Promise<SGNotifyParams> {
    const { modalityParams: sgNotifyParams } = notification
    const authzToken = await this.getAuthzToken()
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
            Authorization: `Bearer ${authzToken}`,
          },
        },
      )
      const notificationPayload = (await this.decryptAndVerifyPayload(
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
   * Get authz token from SG-Notify endpoint
   * @return decrypted authz token
   */
  async getAuthzToken(): Promise<string> {
    const { clientId, clientSecret } = this.config
    const authJweObject = await this.signAndEncryptPayload({
      client_id: clientId,
      client_secret: clientSecret,
    })
    try {
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
      const authPayload = (await this.decryptAndVerifyPayload(
        data.token,
      )) as AuthPayload
      return authPayload.access_token
    } catch (e) {
      if ((e as AxiosError).response?.status === 400) {
        this.logger.log({
          message: `Bad request: ${e}`,
          authJweObject,
        })
      } else if ((e as AxiosError).response?.status === 401) {
        this.logger.log({
          message: `Unauthorized request: ${e}`,
          authJweObject,
        })
      }
      throw e
    }
  }

  /**
   * decrypt and verify encrypted payloads from SGNotify endpoint (used in both authz and notification endpoints)
   * @return custom SGNotifyPayload that specifies the decrypted payload's shape
   */
  async decryptAndVerifyPayload(
    encryptedPayload: string,
  ): Promise<SGNotifyPayload> {
    // TODO: error handling if decryption fails for some reason
    const { plaintext } = await jose.compactDecrypt(
      encryptedPayload,
      this.ecPrivateKey,
    )
    const signedJWT = new TextDecoder().decode(plaintext)
    const { payload } = await jose.jwtVerify(
      signedJWT,
      this.SGNotifyPublicKeySig,
    )
    return payload
  }

  /**
   * sign and encrpyt payload to be sent to SGNotify endpoint (used in both authz and notification endpoints)
   * @return JWE object
   */
  async signAndEncryptPayload(payload: JWTPayload): Promise<string> {
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
      .encrypt(this.SGNotifyPublicKeyEnc)
  }

  hydrateSgNotifyTemplate(sgNotifyParams: SGNotifyParams): JWTPayload {
    const {
      agencyLogoUrl,
      senderName,
      templateId,
      sgNotifyLongMessageParams,
      title,
      uin,
    } = sgNotifyParams
    // TODO: process different message templates programmatically (part 2/2)
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
