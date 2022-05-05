import { StackProps } from "aws-cdk-lib"
import { DatabaseStackConfig } from "./lib/database.stack"
import { BeanstalkStackConfig } from "./lib/beanstalk.stack"
import { NetworkingStackConfig } from "./lib/networking.stack"
import { AcmStackConfig } from "./lib/acm.stack"
import { S3StackConfig } from "./lib/s3.stack"
import { BastionStackConfig } from "./lib/bastionHost.stack"
import { VpnStackConfig } from "./lib/vpn.stack"

export type BaseStackProps = StackProps & {
  appName: string
  environment: string
  appNamePrefix: string
  env: {
    accountId: string
    region: string
  }
}

/**
 * EnvConfig takes optional configurations for each stack, 
 * specified per environment. If the configurations are not 
 * specified, they will default to staging configurations.
 */
export type EnvConfig = {
  acmStack?: AcmStackConfig
  beanstalkStack?: BeanstalkStackConfig
  vpnStack?: VpnStackConfig
  databaseStack?: DatabaseStackConfig
  networkingStack?: NetworkingStackConfig
  s3Stack?: S3StackConfig
  bastionStack?: BastionStackConfig
}