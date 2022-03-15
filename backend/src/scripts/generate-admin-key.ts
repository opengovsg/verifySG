import 'dotenv/config'

import { ConfigService } from 'core/providers'
import { KeyHashService } from 'common/providers/key-hash.service'

function main() {
  const configService = new ConfigService()
  const keyHashService = new KeyHashService(configService)

  const key = keyHashService.generateKey()
  const hash = keyHashService.generateHashFromKey(key)

  console.log(
    JSON.stringify(
      {
        key,
        hash,
      },
      null,
      4,
    ),
  )
}

main()
