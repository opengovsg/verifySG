import 'dotenv/config'

import crypto from 'crypto'
import bcrypt from 'bcrypt'

import { schema } from 'core/config.schema'
import convict from 'convict'

const config = convict(schema)

function main() {
  const { length, saltRounds } = config.get('adminKey')
  const key = crypto.randomBytes(length / 2).toString('hex')
  const hash = bcrypt.hashSync(key, saltRounds)

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
