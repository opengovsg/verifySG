import { Schema, addFormats } from 'convict'

export interface ConfigSchema {
  frontend_urls: {
    frontend_govt_base: string
    frontend_public_base: string
  }
  port: number
  environment: 'development' | 'staging' | 'production' | 'test'
  awsRegion: string
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
  session: { name: string; secret: string; cookie: { maxAge: number } }
  sgid: {
    hostname: string
    clientId: string
    secret: string
    scopes: string[]
    privateKey: string
    callbackUrl: string
  }
}

addFormats({
  'required-string': {
    validate: (val?: string): void => {
      if (val == undefined || val === '') {
        throw new Error('Required value cannot be empty')
      }
    },
  },
  'sgid-scopes': {
    validate: (scopes: string[]): void => {
      // must be array of strings which include openid
      if (!scopes.length || !scopes.includes('openid')) {
        throw new Error('Invalid scopes')
      }
    },
    coerce: (val: string): string[] => {
      if (val) {
        return val.toLowerCase().split(' ')
      }
      return []
    },
  },
})

export const schema: Schema<ConfigSchema> = {
  frontend_urls: {
    frontend_govt_base: {
      doc: 'The frontend government base url',
      env: 'FRONTEND_GOVT',
      format: String,
      default: 'http://localhost:3001',
    },
    frontend_public_base: {
      doc: 'The frontend public base url',
      env: 'FRONTEND_PUBLIC',
      format: String,
      default: 'http://localhost:3000',
    },
  },
  port: {
    doc: 'The port that the service listens on',
    env: 'PORT',
    format: 'int',
    default: 8080,
  },
  environment: {
    doc: 'The environment that Node.js is running in',
    env: 'NODE_ENV',
    format: ['development', 'staging', 'production', 'test'],
    default: 'development',
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
  session: {
    name: {
      doc: 'Name of session ID cookie to set in response',
      env: 'SESSION_NAME',
      default: 'verifysg.sid',
      format: String,
    },
    secret: {
      doc: 'A secret string used to generate sessions for users',
      env: 'SESSION_SECRET',
      sensitive: true,
      default: 'toomanysecrets',
      format: String,
    },
    cookie: {
      maxAge: {
        doc: 'The maximum age for a cookie, expressed in ms',
        env: 'COOKIE_MAX_AGE',
        format: 'int',
        default: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    },
  },
  sgid: {
    hostname: {
      doc: 'Hostname for SGID',
      env: 'SGID_HOSTNAME',
      default: 'https://api.id.gov.sg',
      format: String,
    },
    clientId: {
      doc: 'Client ID for sgid oauth',
      env: 'SGID_CLIENT_ID',
      default: '',
      format: 'required-string',
    },
    secret: {
      doc: 'Client secret for sgid oauth',
      env: 'SGID_SECRET',
      default: '',
      format: 'required-string',
    },
    scopes: {
      doc: 'Scopes for sgid (space separated)',
      env: 'SGID_SCOPES',
      default: ['openid', 'myinfo.nric'],
      format: 'sgid-scopes',
    },
    privateKey: {
      doc: 'RSA 2048 private key for sgid oauth (in PKCS8 pem format)',
      env: 'SGID_PRIVATE_KEY',
      default: '',
      format: 'required-string',
    },
    callbackUrl: {
      doc: 'Callback url for sgid oauth',
      env: 'SGID_CALLBACK_URL',
      default: 'http://localhost:3000/callback',
      format: 'required-string',
    },
  },
}
