import { createHash, randomBytes, timingSafeEqual } from 'crypto'

import { Injectable } from '@nestjs/common'
import { ConfigSchema } from 'core/config.schema'

import { ConfigService } from 'core/providers'

@Injectable()
export class KeyHashService {
  private config: ConfigSchema['adminKey']

  constructor(private configService: ConfigService) {
    this.config = this.configService.get('adminKey')
  }

  generateKey(): string {
    return randomBytes(this.config.length).toString('base64')
  }

  generateHashFromKey(key: string): string {
    return createHash(this.config.algo).update(key).digest('base64')
  }

  compareKeyHash(key: string, hash: string): boolean {
    const hashedKey = this.generateHashFromKey(key)

    // timingSafeEqual(a,b) assumes a, b have same byte length
    // See https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b
    return (
      hashedKey.length === hash.length &&
      timingSafeEqual(Buffer.from(hashedKey), Buffer.from(hash))
    )
  }
}
