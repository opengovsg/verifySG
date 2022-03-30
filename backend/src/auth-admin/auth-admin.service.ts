import { Injectable } from '@nestjs/common'

import { ConfigService } from 'core/providers'
import { KeyHashService } from 'common/providers/key-hash.service'

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
