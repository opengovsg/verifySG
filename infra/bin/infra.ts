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
const stackProps = {
  app: config.get('applicationName'),
  environment: config.get('environment'),
  appNamePrefix: `${config.get('applicationName')}-${config.get(
    'environment',
  )}`,
  env: {
    account: config.get('cdkAccountId'),
    region: config.get('awsRegion'),
  },
}

const acmStack = new AcmStack(
  app,
  `AcmStack-${config.get('environment')}`,
  stackProps,
)
const networkingStack = new NetworkingStack(
  app,
  `VPCStack-${config.get('environment')}`,
  stackProps,
)
const databaseStack = new DatabaseStack(
  app,
  `DBStack-${config.get('environment')}`,
  {
    ...stackProps,
    vpc: networkingStack.vpc,
    databaseSg: networkingStack.securityGroups.rds,
    ec2Sg: networkingStack.securityGroups.ec2,
    databaseName: config.get('database.name'),
  },
)
databaseStack.addDependency(networkingStack)
// beanstalk stuff
const beanstalkStack = new BeanstalkStack(
  app,
  `BeanstalkStack-${config.get('environment')}`,
  {
    ...stackProps,
    vpc: networkingStack.vpc,
    ec2SubnetIds: networkingStack.privateSubnetsIds,
    publicSubnetIds: networkingStack.publicSubnetIds,
    securityGroup: networkingStack.securityGroups.ec2,
    sslCert: acmStack.sslCert,
  },
)
beanstalkStack.addDependency(networkingStack)
const s3Stack = new S3Stack(
  app,
  `S3Stack-${config.get('environment')}`,
  stackProps,
)
const bastionStack = new BastionStack(
  app,
  `BastionStack-${config.get('environment')}`,
  {
    ...stackProps,
    vpc: networkingStack.vpc,
    bastionSecurityGroup: networkingStack.securityGroups.bastion,
  },
)
bastionStack.addDependency(networkingStack)

const vpnStack = new VPNStack(app, `VPNStack-${config.get('environment')}`, {
  ...stackProps,
  vpc: networkingStack.vpc,
  clientCertArn: config.get('clientCertArn'),
  serverCertArn: config.get('serverCertArn'),
  samlProviderArn: config.get('samlProviderArn'),
  vpnSecurityGroup: networkingStack.securityGroups.vpn,
})
vpnStack.addDependency(networkingStack)