import { addFormats, Schema } from 'convict'
import convict = require('convict')

export interface ConfigSchema {
  environment: 'staging' | 'production' | 'test'
  cdkAccountId: string,
  clientCertArn: string,
  serverCertArn: string,
  samlProviderArn: string,
  awsRegion: string,
  database: {
    host: string
    username: string
    password: string
    port: number
    name: string
    logging: boolean
    minPool: number
    maxPool: number
  }
  applicationName: string
}

// add format for required strings (no defaults)
addFormats({
  'required-string': {
    validate: (val?: string): void => {
      if (val == undefined || val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
    coerce: (val: any): any => {
      if (val === null) {
        return undefined
      }
      return val
    },
  },
})

const schema: Schema<ConfigSchema> = {
  cdkAccountId: {
    env: 'CDK_ACCOUNT_ID',
    default: '',
    format: 'required-string',
  },
  clientCertArn: {
    env: 'AWS_VPN_CLIENT_CERT_ARN',
    default: '',
    format: 'required-string',
  },
  serverCertArn: {
    env: 'AWS_VPN_SERVER_CERT_ARN',
    default: '',
    format: 'required-string',
  },
  samlProviderArn: {
    env: 'AWS_SAML_PROVIDER_ARN',
    default: '',
    format: 'required-string',
  },
  applicationName: {
    env: 'APPLICATION_NAME',
    default: 'checkwho',
    format: 'required-string',
  },
  environment: {
    doc: 'The environment that Node.js is running in',
    env: 'NODE_ENV',
    format: ['staging', 'production', 'test'],
    default: 'staging',
  },
  awsRegion: {
    doc: 'The AWS region for SES. Optional, logs mail to console if absent',
    env: 'AWS_REGION',
    format: String,
    default: 'ap-southeast-1',
  },
  database: {
    username: {
      env: 'DB_USERNAME',
      sensitive: true,
      default: '',
      format: String,
    },
    password: {
      env: 'DB_PASSWORD',
      sensitive: true,
      default: '',
      format: String,
    },
    host: {
      env: 'DB_HOST',
      default: 'localhost',
      format: String,
    },
    port: {
      env: 'DB_PORT',
      default: 5432,
      format: Number,
    },
    name: {
      env: 'DB_NAME',
      default: '',
      format: 'required-string',
    },
    logging: {
      env: 'ENABLE_DB_LOGGING',
      default: false,
    },
    minPool: {
      env: 'DB_MIN_POOL_SIZE',
      default: 50,
    },
    maxPool: {
      env: 'DB_MAX_POOL_SIZE',
      default: 200,
    },
  },
}

// valid schema
const config = convict(schema)
config.validate()

// export schema
export default config
