#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import config from '../config'
import { AcmStack } from '../lib/acm.stack'
import { NetworkingStack } from '../lib/networking.stack'
import { DatabaseStack } from '../lib/database.stack'
import { BeanstalkStack } from '../lib/beanstalk.stack'
import { S3Stack } from '../lib/s3.stack'
import { BastionStack } from '../lib/bastionHost.stack'
import { VPNStack } from '../lib/vpn.stack'

const app = new cdk.App()

const appName = config.get('applicationName')
const environment = config.get('environment')
console.log(`launching ${appName} for ${environment}`)

const stackProps = {
  appName,
  environment,
  appNamePrefix: `${appName}-${environment}`,
  env: {
    accountId: config.get('awsAccountId'),
    region: config.get('awsRegion'),
  },
}

const acmStack = new AcmStack(
  app,
  `AcmStack-${environment}`,
)
const networkingStack = new NetworkingStack(
  app,
  `VPCStack-${environment}`,
)
const databaseStack = new DatabaseStack(
  app,
  `DBStack-${environment}`,
  {
    ...stackProps,
    vpc: networkingStack.vpc,
    databaseSg: networkingStack.securityGroups.rds,
    ec2Sg: networkingStack.securityGroups.ec2,
    databaseName: config.get('database.name'),
  },
)
databaseStack.addDependency(networkingStack)

const s3Stack = new S3Stack(
  app,
  `S3Stack-${environment}`,
  stackProps,
)

const beanstalkStack = new BeanstalkStack(
  app,
  `BeanstalkStack-${environment}`,
  {
    ...stackProps,
    vpc: networkingStack.vpc,
    ec2SubnetIds: networkingStack.privateSubnetsIds,
    publicSubnetIds: networkingStack.publicSubnetIds,
    securityGroup: networkingStack.securityGroups.ec2,
    sslCert: acmStack.sslCert,
    accessLogsBucketName: s3Stack.bucket.bucketName,
  },
)
beanstalkStack.addDependency(networkingStack)

const bastionStack = new BastionStack(
  app,
  `BastionStack-${environment}`,
  {
    ...stackProps,
    vpc: networkingStack.vpc,
    bastionSecurityGroup: networkingStack.securityGroups.bastion,
  },
)
bastionStack.addDependency(networkingStack)

const vpnStack = new VPNStack(app, `VPNStack-${environment}`, {
  ...stackProps,
  vpc: networkingStack.vpc,
  clientCertArn: config.get('clientCertArn'),
  serverCertArn: config.get('serverCertArn'),
  samlProviderArn: config.get('samlProviderArn'),
  vpnSecurityGroup: networkingStack.securityGroups.vpn,
})
vpnStack.addDependency(networkingStack)