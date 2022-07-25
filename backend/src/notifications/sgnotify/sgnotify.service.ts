import axios, { AxiosError, AxiosInstance } from 'axios'
import crypto from 'crypto'
import * as jose from 'jose'
import { JWTPayload } from 'jose'
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common'

import { ConfigService, Logger } from '../../core/providers'
import { ConfigSchema } from '../../core/config.schema'
import {
  Notification,
  SGNotifyNotificationStatus,
} from '../../database/entities'
import {
  AuthResPayload,
  GetSGNotifyJwksDto,
  NotificationResPayload,
  PostSGNotifyAuthzDto,
  PostSGNotifyJweDto,
  SGNotifyResPayload,
} from './dto'
import {
  convertSGNotifyParamsToJWTPayload,
  insertECPrivateKeyHeaderAndFooter,
  SGNotifyParams,
} from './utils'

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
    try {
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
    } catch (e) {
      this.logger.error(
        `Internal server error when calling SGNotify endpoint.\nError: ${e}`,
      )
      throw new ServiceUnavailableException(
        'Unable to send notification due to an error with Singpass. Please try again later.', // displayed on frontend
      )
    }
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
    const [authzToken, jweObject] = await Promise.all([
      this.getAuthzToken(),
      this.signAndEncryptPayload(
        convertSGNotifyParamsToJWTPayload(sgNotifyParams),
      ),
    ])
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
      const notificationResPayload = (await this.decryptAndVerifyPayload(
        jwe,
      )) as NotificationResPayload
      return {
        ...sgNotifyParams,
        requestId: notificationResPayload.request_id,
        sgNotifyLongMessageParams: {
          ...sgNotifyParams.sgNotifyLongMessageParams,
        },
        status: SGNotifyNotificationStatus.SENT_BY_SERVER,
      }
    } catch (e) {
      if ((e as AxiosError).response?.status === 404) {
        this.logger.error(
          `NRIC ${notification.recipientId} provided not found.`,
        )
        throw new BadRequestException(
          'Unable to send notification as NRIC specified does not have an associated Singpass Mobile app.', // displayed on frontend
        )
      }
      this.logger.error(
        `Internal server error when calling SGNotify endpoint.\nError: ${e}`,
      )
      throw new ServiceUnavailableException(
        'Unable to send notification due to an error with Singpass. Please try again later.', // displayed on frontend
      )
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
      const authResPayload = (await this.decryptAndVerifyPayload(
        data.token,
      )) as AuthResPayload
      return authResPayload.access_token
    } catch (e) {
      if ((e as AxiosError).response?.status === 401) {
        this.logger.error(
          `SGNotify credentials are invalid.\nError: ${e}.\nauthJweObject: ${authJweObject}`,
        )
      } else {
        this.logger.error(
          `Internal server error when calling SGNotify endpoint.\nError: ${e}`,
        )
      }
      throw new ServiceUnavailableException(
        'Unable to send notification due to an error with Singpass. Please try again later.', // displayed on frontend
      )
    }
  }

  /**
   * decrypt and verify encrypted payloads from SGNotify endpoint (used in both authz and notification endpoints)
   * @return custom SGNotifyPayload that specifies the decrypted payload's shape
   */
  async decryptAndVerifyPayload(
    encryptedPayload: string,
  ): Promise<SGNotifyResPayload> {
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
}
