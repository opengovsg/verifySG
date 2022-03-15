import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'

import { ConfigService } from 'core/providers'

@Injectable()
export class AuthAdminService {
  constructor(private config: ConfigService) {}

  async validateAdminKey(adminKeyHeader?: string): Promise<boolean> {
    if (!adminKeyHeader) return false

    const [headerKey, key] = adminKeyHeader.trim().split(' ')
    if (headerKey.toLowerCase() !== 'bearer' || !key) return false

    const { hash } = this.config.get('adminKey')
    const valid = await bcrypt.compare(key, hash)
    return valid
  }
}
