#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import config from '../config'
import { CoreStack } from '../lib/core.stack'
import { DatabaseStack } from '../lib/database.stack'
import { BeanstalkStack } from '../lib/beanstalk.stack'
import { S3Stack } from '../lib/s3.stack'
import { BastionStack } from '../lib/bastionHost.stack'

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

const coreStack = new CoreStack(
  app,
  `VPCStack-${config.get('environment')}`,
  stackProps,
)
const databaseStack = new DatabaseStack(
  app,
  `DBStack-${config.get('environment')}`,
  {
    ...stackProps,
    vpc: coreStack.vpc,
    databaseSg: coreStack.securityGroups.rds,
    ec2Sg: coreStack.securityGroups.ec2,
    databaseName: config.get('database.name'),
  },
)
databaseStack.addDependency(coreStack)
// beanstalk stuff
const beanstalkStack = new BeanstalkStack(
  app,
  `BeanstalkStack-${config.get('environment')}`,
  {
    ...stackProps,
    vpc: coreStack.vpc,
    ec2SubnetIds: coreStack.privateSubnetsIds,
    publicSubnetIds: coreStack.publicSubnetIds,
    securityGroup: coreStack.securityGroups.ec2,
  },
)
beanstalkStack.addDependency(coreStack)
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
    vpc: coreStack.vpc,
    bastionSecurityGroup: coreStack.securityGroups.bastion,
  },
)
bastionStack.addDependency(coreStack)
