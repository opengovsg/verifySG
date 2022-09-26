import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import { Context } from './config'

export interface CreateVpcArgs {
  secondOctet: number
}

export function createVpc(
  { secondOctet }: CreateVpcArgs,
  { fullName, env }: Context,
): awsx.ec2.Vpc {
  if (!Number.isInteger(secondOctet))
    throw Error('secondOctet must be an integer')
  if (secondOctet < 0 || secondOctet > 255)
    throw Error('secondOctet must be between [0, 255]')

  const isProduction = env === 'production'

  const vpc = new awsx.ec2.Vpc(fullName, {
    cidrBlock: `${isProduction ? 10 : 172}.${secondOctet}.0.0/16`,
    numberOfAvailabilityZones: isProduction ? 'all' : 2,
    numberOfNatGateways: isProduction ? undefined : 1,
    subnets: [
      { type: 'private', name: 'compute', cidrMask: 19 },
      { type: 'public', name: 'edge', cidrMask: 20 },
      { type: 'isolated', name: 'storage', cidrMask: 21 },
    ],
    tags: {
      Name: fullName,
    },
  })

  enableFlowLoggingToCloudWatchLogs(vpc, fullName)

  return vpc
}

function enableFlowLoggingToCloudWatchLogs(
  vpc: awsx.ec2.Vpc,
  fullName: string,
) {
  const flowLogsRole = new aws.iam.Role(
    `${fullName}-flow-logs-role`,
    {
      description: `${fullName} VPC Flow Logs`,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
        aws.iam.Principals.VpcFlowLogsPrincipal,
      ),
    },
    { parent: vpc },
  )

  const flowLogsGroup = new aws.cloudwatch.LogGroup(
    `${fullName}-vpc-flow-logs`,
    {
      tags: {
        Name: `${fullName} VPC Flow Logs`,
      },
    },
    { parent: flowLogsRole },
  )

  new aws.iam.RolePolicy(
    `${fullName}-flow-log-policy`,
    {
      name: 'vpc-flow-logs',
      role: flowLogsRole.id,
      policy: {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Resource: '*',
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents',
              'logs:DescribeLogGroups',
              'logs:DescribeLogStreams',
            ],
          },
        ],
      },
    },
    { parent: flowLogsRole },
  )

  new aws.ec2.FlowLog(
    `${fullName}-flow-logs`,
    {
      logDestination: flowLogsGroup.arn,
      iamRoleArn: flowLogsRole.arn,
      vpcId: vpc.id,
      trafficType: 'ALL',
    },
    { parent: flowLogsRole },
  )
}
