import { Injectable } from '@nestjs/common'

import { KeyHashService } from 'common/providers/key-hash.service'
import { ConfigService } from 'core/providers'

@Injectable()
export class AuthAdminService {
  constructor(
    private config: ConfigService,
    private keyHashService: KeyHashService,
  ) {}

  async validateAdminKey(adminKeyHeader?: string): Promise<boolean> {
    if (!adminKeyHeader) return false

    const [headerKey, key] = adminKeyHeader.trim().split(' ')
    if (headerKey.toLowerCase() !== 'bearer' || !key) return false

    const { hash } = this.config.get('adminKey')
    return this.keyHashService.compareKeyHash(key, hash)
  }
}
