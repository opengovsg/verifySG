// Adapted from https://github.com/datagovsg/healthsync

import { Injectable } from '@nestjs/common'
import { Client, Issuer, generators } from 'openid-client'
import { importPKCS8, importJWK, compactDecrypt } from 'jose'

import { ConfigService } from 'core/providers'
import { ConfigSchema } from 'core/config.schema'
import { MopDto } from 'mops/dto'

@Injectable()
export class SgidService {
  private client: Client
  private config: ConfigSchema['sgid']

  constructor(private configService: ConfigService) {
    this.config = this.configService.get('sgid')
    const { hostname, clientId, secret, callbackUrl } = this.config

    const issuer = new Issuer({
      issuer: hostname,
      authorization_endpoint: hostname + '/v1/oauth/authorize',
      token_endpoint: hostname + '/v1/oauth/token',
      userinfo_endpoint: hostname + '/v1/oauth/userinfo',
      jwks_uri: hostname + '/.well-known/jwks.json',
    })
    this.client = new issuer.Client({
      client_id: clientId,
      client_secret: secret,
      id_token_signed_response_alg: 'RS256', // default
      response_types: ['code'], // default
      redirect_uris: [callbackUrl],
      token_endpoint_auth_method: 'client_secret_post',
    })
  }

  /**
   * Generates an SHA-256 hash in base64url format
   * @param text string to hash
   * @returns
   */
  generateSHA256Hash(text: string): string {
    return generators.codeChallenge(text)
  }

  /**
   * Generate oauth authorization url.
   * Uses cookie's sid to generate a state value to verify the same user agent
   * is providing the auth code
   * @param sessionId cookie sid
   * @returns auth url
   */
  createAuthorizationUrl(sessionId: string): string {
    return this.client.authorizationUrl({
      scope: this.config.scopes.join(' '),
      state: this.generateSHA256Hash(sessionId),
    })
  }

  async handleCallback(
    code: string,
    state: string,
    sessionId: string,
  ): Promise<MopDto> {
    /**
     * This validates the state,
     * exchange auth code for access token
     * and verify id_token with jwk
     */
    const tokenSet = await this.client.callback(
      this.config.callbackUrl,
      { code, state },
      {
        // Checks sessionId hash against state
        state: this.generateSHA256Hash(sessionId),
      },
    )

    /**
     * Fetch userinfo with access token in as bearer header
     * method: 'GET', // default
     * via: 'header', //default
     * tokenType: 'Bearer', // default
     */
    const userInfo = await this.client.userinfo<{
      data: Record<string, string>
      key: string
    }>(tokenSet)

    const { data, key } = userInfo
    const decrypted = await this.decryptPayload(key, data)
    return { nric: decrypted['myinfo.nric_number'] }
  }

  async decryptPayload(
    encryptedKey: string,
    data: Record<string, string>,
  ): Promise<Record<string, string>> {
    const { privateKey: privateKeyString } = this.config
    // Import client private key in PKCS8 format
    const privateKey = await importPKCS8(privateKeyString, 'RSA-OAEP-256')

    // Decrypt key to get plaintext symmetric key
    const decoder = new TextDecoder()
    const decryptedKey = decoder.decode(
      (await compactDecrypt(encryptedKey, privateKey)).plaintext,
    )
    const jwk = await importJWK(JSON.parse(decryptedKey))

    // Decrypt each jwe in body
    const result: Record<string, string> = {}
    for (const field in data) {
      const jwe = data[field]
      const decryptedValue = decoder.decode(
        (await compactDecrypt(jwe, jwk)).plaintext,
      )
      result[field] = decryptedValue
    }
    return result
  }
}
