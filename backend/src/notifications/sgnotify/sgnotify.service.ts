import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common'
import axios, { AxiosError, AxiosInstance } from 'axios'
import crypto from 'crypto'
import * as jose from 'jose'
import { JWTPayload } from 'jose'

import {
  CompactJWEHeaderParameters,
  JWTHeaderParameters,
} from 'jose/dist/types/types'

import { ConfigSchema } from '../../core/config.schema'
import { ConfigService, Logger } from '../../core/providers'
import {
  AUTHZ_ENDPOINT,
  NO_SINGPASS_MOBILE_APP_FOUND_MESSAGE,
  NOTIFICATION_ENDPOINT,
  NOTIFICATION_RESPONSE_ERROR_MESSAGE,
  PUBLIC_KEY_ENDPOINT,
  PUBLIC_KEY_ENDPOINT_UNAVAILABLE,
  PUBLIC_KEY_IMPORT_ERROR,
  PUBLIC_KEY_NOT_FOUND,
  SGNOTIFY_UNAVAILABLE_MESSAGE,
} from '../constants'

import {
  AuthResPayload,
  GetSGNotifyJwksDto,
  NotificationResPayload,
  PostSGNotifyAuthzResDto,
  PostSGNotifyJweResDto,
  SGNotifyResPayload,
} from './dto'
import {
  convertParamsToNotificationRequestPayload,
  insertECPrivateKeyHeaderAndFooter,
  SGNotifyNotificationStatus,
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
   *This is called only once during initialization
   */
  async getPublicKeysSigEnc(): Promise<[Key, Key]> {
    // TODO: error handling if URL is down for some reason; fall back to hardcoded public key?
    const { data } = await this.client
      .get<GetSGNotifyJwksDto>(PUBLIC_KEY_ENDPOINT)
      .catch((error) => {
        this.logger.error(
          `Error when getting public key from SGNotify discovery endpoint.
          Error: ${error}`,
        )
        throw new BadGatewayException(PUBLIC_KEY_ENDPOINT_UNAVAILABLE)
      })
    const sigKeyJwk = data.keys.find((key) => key.use === 'sig')
    const encKeyJwk = data.keys.find((key) => key.use === 'enc')
    if (!sigKeyJwk || !encKeyJwk) {
      this.logger.error(
        `Either signature or encryption key not found in SGNotify discovery endpoint.
        Received data: ${JSON.stringify(data)}`,
      )
      throw new BadGatewayException(PUBLIC_KEY_NOT_FOUND)
    }
    const [publicKeySig, publicKeyEnc] = await Promise.all([
      jose.importJWK(sigKeyJwk, 'ES256'),
      jose.importJWK(encKeyJwk, 'ES256'),
    ]).catch((error) => {
      this.logger.error(
        `Error when importing public key from SGNotify discovery endpoint.
        Signature key: ${JSON.stringify(sigKeyJwk)}
        Encryption key: ${JSON.stringify(encKeyJwk)}
        Error: ${error}`,
      )
      throw new BadGatewayException(PUBLIC_KEY_IMPORT_ERROR)
    })
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
   * decrypts notificationResPayload and adds requestId to SGNotifyParams
   * @returns SGNotifyParams
   * (actual updating of db not done by this function)
   */
  async sendNotification(
    sgNotifyParams: SGNotifyParams,
  ): Promise<SGNotifyParams> {
    const notificationRequestPayload =
      convertParamsToNotificationRequestPayload(sgNotifyParams)
    const [authzToken, jweObject] = await Promise.all([
      this.getAuthzToken(),
      this.signAndEncryptPayload(notificationRequestPayload),
    ])
    const {
      data: { jwe },
    } = await this.client
      .post<PostSGNotifyJweResDto>(
        NOTIFICATION_ENDPOINT,
        {
          jwe: jweObject,
        },
        {
          headers: {
            Authorization: `Bearer ${authzToken}`,
          },
        },
      )
      .catch((error) => {
        // this is an expected error; user does not have Singpass mobile app installed
        if ((error as AxiosError).response?.status === 404) {
          this.logger.log(`NRIC ${sgNotifyParams.nric} provided not found.`)
          throw new BadRequestException(NO_SINGPASS_MOBILE_APP_FOUND_MESSAGE)
        }
        // catch residual errors; likely candidates:
        // 1. missing mandatory fields (no type-checking based on message template)
        // 2. SGNotify is down
        this.logger.error(
          `Unexpected error when sending notification to SGNotify.
          Payload sent:${JSON.stringify(notificationRequestPayload)}
          Error: ${error}`,
        )
        throw new ServiceUnavailableException(SGNOTIFY_UNAVAILABLE_MESSAGE)
      })
    const notificationResPayload = (await this.decryptAndVerifyPayload(
      jwe,
    ).catch((error) => {
      this.logger.error(
        `Error when decrypting and verifying notification response payload.
        Payload received: ${JSON.stringify(jwe)}
        Error: ${error}`,
      )
      // different error message since this (1) happens after notification is sent; (2) but is still consequential as requestId is not updated (function halts prematurely)
      // as such, asked user to contact us if they see this
      throw new BadGatewayException(NOTIFICATION_RESPONSE_ERROR_MESSAGE)
    })) as NotificationResPayload
    if (!notificationResPayload.request_id) {
      this.logger.error(
        `Successfully decrypted notificationResPayload, but request_id not found. ${JSON.stringify(
          notificationResPayload,
        )}`,
      )
      throw new BadGatewayException(NOTIFICATION_RESPONSE_ERROR_MESSAGE)
    }
    return {
      ...sgNotifyParams,
      requestId: notificationResPayload.request_id,
      params: {
        ...sgNotifyParams.params,
      },
      status: SGNotifyNotificationStatus.SENT_BY_SERVER,
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
    const { data } = await this.client
      .post<PostSGNotifyAuthzResDto>(
        AUTHZ_ENDPOINT,
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
      .catch((error) => {
        // should not happen unless our credentials are revoked
        if ((error as AxiosError).response?.status === 401) {
          this.logger.error(
            `SGNotify credentials are invalid.
            authJweObject: ${JSON.stringify(authJweObject)}
            Error: ${error}.`,
          )
        } else {
          // catch residual errors; besides 401, other errors cannot be meaningfully handled on our side
          this.logger.error(
            `Error when getting authz token from SGNotify.
          authJweObject: ${JSON.stringify(authJweObject)}
          Error: ${error}`,
          )
        }
        // throw same error regardless of error type
        throw new ServiceUnavailableException(SGNOTIFY_UNAVAILABLE_MESSAGE)
      })
    const authResPayload = (await this.decryptAndVerifyPayload(
      data.token,
    ).catch((error) => {
      this.logger.error(
        `Error when decrypting and verifying authz token.
        token: ${JSON.stringify(data.token)}
        Error: ${error}`,
      )
      throw new ServiceUnavailableException(SGNOTIFY_UNAVAILABLE_MESSAGE)
    })) as AuthResPayload
    return authResPayload.access_token
  }

  /**
   * decrypt and verify encrypted payloads from SGNotify endpoint (used in both authz and notification endpoints)
   * @return custom SGNotifyResPayload that specifies the decrypted payload's shape
   */
  async decryptAndVerifyPayload(
    encryptedPayload: string,
  ): Promise<SGNotifyResPayload> {
    return decryptAndVerifyPayloadStatic(
      encryptedPayload,
      this.ecPrivateKey,
      this.SGNotifyPublicKeySig,
    )
  }

  /**
   * sign and encrypt payload to be sent to SGNotify endpoint (used in both authz and notification endpoints)
   * @return JWE object
   */
  async signAndEncryptPayload(payload: JWTPayload): Promise<string> {
    const { eServiceId } = this.config
    return encryptAndSignPayloadStatic(
      payload,
      '2m',
      {
        typ: 'JWT',
        alg: 'ES256',
        kid: eServiceId,
      },
      {
        alg: 'ECDH-ES+A256KW',
        enc: 'A256GCM',
        cty: 'JWT',
      },
      this.ecPrivateKey,
      this.SGNotifyPublicKeyEnc,
    )
  }
}

// extracted out for ease of testing in the future
export const decryptAndVerifyPayloadStatic = async (
  encryptedPayload: string,
  ecPrivateKey: Key,
  publicKey: Key,
) => {
  const { plaintext } = await jose.compactDecrypt(
    encryptedPayload,
    ecPrivateKey,
  )
  const signedJWT = new TextDecoder().decode(plaintext)
  const { payload } = await jose.jwtVerify(signedJWT, publicKey)
  return payload as SGNotifyResPayload
}

export const encryptAndSignPayloadStatic = async (
  payload: JWTPayload,
  expirationTime: string,
  jwtHeaderParameters: JWTHeaderParameters,
  jweHeaderParameters: CompactJWEHeaderParameters,
  ecPrivateKey: Key,
  publicKey: Key,
) => {
  const signedJWT = await new jose.SignJWT(payload)
    .setExpirationTime(expirationTime)
    .setProtectedHeader(jwtHeaderParameters)
    .sign(ecPrivateKey)
  return await new jose.CompactEncrypt(new TextEncoder().encode(signedJWT))
    .setProtectedHeader(jweHeaderParameters)
    .encrypt(publicKey)
}
