import { addFormats, Schema } from 'convict'
import convict = require('convict')
import 'dotenv/config'

export interface ConfigSchema {
  environment: 'staging' | 'production' | 'test'
  awsAccountId: string,
  clientCertArn: string,
  serverCertArn: string,
  samlProviderArn: string,
  awsRegion: string,
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
  awsAccountId: {
    doc: 'AWS account ID of application',
    env: 'AWS_ACCOUNT_ID',
    default: '',
    format: 'required-string',
  },
  clientCertArn: {
    env: 'AWS_VPN_CLIENT_CERT_ARN',
    default: '',
    format: String,
  },
  serverCertArn: {
    env: 'AWS_VPN_SERVER_CERT_ARN',
    default: '',
    format: String,
  },
  samlProviderArn: {
    env: 'AWS_SAML_PROVIDER_ARN',
    default: '',
    format: 'required-string',
  },
  applicationName: {
    doc: 'Application name used on AWS for identifying resources',
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
    doc: 'The AWS region for deploying services in. Defaults to ap-southeast-1',
    env: 'AWS_REGION',
    format: String,
    default: 'ap-southeast-1',
  },
}

// valid schema
const config = convict(schema)
config.validate()

// export schema
export default config
