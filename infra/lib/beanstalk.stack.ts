import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { BaseStackProps } from '../infra.types'
import * as cdk from 'aws-cdk-lib'
import * as elasticbeanstalk from 'aws-cdk-lib/aws-elasticbeanstalk'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

export type BeanstalkStackConfig = {
  solutionStackName?: string
  minInstances?: string
  maxInstances?: string
  instanceType?: string
}

type BeanstalkStackProps = BaseStackProps & BeanstalkStackConfig & {
  vpc: ec2.Vpc
  publicSubnetIds: string[]
  ec2SubnetIds: string[]
  securityGroup: ec2.SecurityGroup
  accessLogsBucketName: string
  sslCert: acm.Certificate
}

export class BeanstalkStack extends Stack {
  constructor(scope: Construct, id: string, props: BeanstalkStackProps) {
    super(scope, id, props)

    const EbInstanceRole = new cdk.aws_iam.Role(
      this,
      `${props.appNamePrefix}-aws-elasticbeanstalk-ec2-role`,
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com'),
      },
    )

    const managedPolicy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
      'AWSElasticBeanstalkWebTier',
    )
    EbInstanceRole.addManagedPolicy(managedPolicy)

    const profileName = `${props.appNamePrefix}-InstanceProfile`
    new cdk.aws_iam.CfnInstanceProfile(this, profileName, {
      instanceProfileName: profileName,
      roles: [EbInstanceRole.roleName],
    })

    const app = new elasticbeanstalk.CfnApplication(
      this,
      `${props.appNamePrefix}-application`,
      { applicationName: `${props.appNamePrefix}-application` },
    )

    const env = new elasticbeanstalk.CfnEnvironment(
      this,
      `${props.appNamePrefix}-environment`,
      {
        environmentName: `${props.appNamePrefix}-environment`,
        solutionStackName:
          props.solutionStackName ??
          '64bit Amazon Linux 2 v5.5.0 running Node.js 14',
        applicationName: `${props.appNamePrefix}-application`,
        optionSettings: [
          {
            namespace: 'aws:autoscaling:launchconfiguration',
            optionName: 'IamInstanceProfile',
            value: profileName,
          },
          {
            namespace: 'aws:autoscaling:launchconfiguration',
            optionName: 'SecurityGroups',
            value: props.securityGroup.securityGroupId,
          },
          // LOGS
          {
            namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
            optionName: 'StreamLogs',
            value: 'true',
          },
          {
            namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
            optionName: 'RetentionInDays',
            value: '365',
          },
          // LOAD BALANCER
          {
            namespace: 'aws:elasticbeanstalk:environment',
            optionName: 'LoadBalancerType',
            value: 'application',
          },
          {
            namespace: 'aws:elbv2:listener:default',
            optionName: 'ListenerEnabled',
            value: 'False',
          },
          {
            namespace: 'aws:elbv2:listener:443',
            optionName: 'DefaultProcess',
            value: 'default',
          },
          {
            namespace: 'aws:elbv2:listener:443',
            optionName: 'Protocol',
            value: 'HTTPS',
          },
          {
            namespace: 'aws:elbv2:listener:443',
            optionName: 'SSLCertificateArns',
            value: props.sslCert.certificateArn,
          },
          {
            namespace: 'aws:elbv2:listener:443',
            optionName: 'ListenerEnabled',
            value: 'true',
          },
          {
            namespace: 'aws:elbv2:loadbalancer',
            optionName: 'AccessLogsS3Bucket',
            value: props.accessLogsBucketName,
          },
          {
            namespace: 'aws:elbv2:loadbalancer',
            optionName: 'AccessLogsS3Enabled',
            value: 'true',
          },
          {
            namespace: 'aws:elbv2:loadbalancer',
            optionName: 'AccessLogsS3Prefix',
            value: props.environment,
          },
          // NETWORKING
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'VPCId',
            value: props.vpc.vpcId,
          },
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'ELBSubnets',
            value: props.publicSubnetIds.join(','),
          },
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'Subnets',
            value: props.ec2SubnetIds.join(','),
          },
          // CAPACITY
          {
            namespace: 'aws:ec2:instances',
            optionName: 'InstanceTypes',
            value: props.instanceType ?? 't2.micro',
          },
          {
            namespace: 'aws:autoscaling:asg',
            optionName: 'MinSize',
            value: props.minInstances ?? '1',
          },
          {
            namespace: 'aws:autoscaling:asg',
            optionName: 'MaxSize',
            value: props.maxInstances ?? '1',
          },
          // ROLLING UPDATES AND DEPLOYMENTS
          {
            namespace: 'aws:autoscaling:updatepolicy:rollingupdate',
            optionName: 'RollingUpdateType',
            value: 'Health',
          },
          {
            namespace: 'aws:elasticbeanstalk:command',
            optionName: 'DeploymentPolicy',
            value: 'RollingWithAdditionalBatch',
          },
          // MANAGED UPDATES
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'ManagedActionsEnabled',
            value: 'true',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions:platformupdate',
            optionName: 'InstanceRefreshEnabled',
            value: 'true',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'ServiceRoleForManagedUpdates',
            value: 'AWSServiceRoleForElasticBeanstalkManagedUpdates',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions:platformupdate',
            optionName: 'UpdateLevel',
            value: 'minor',
          },
          {
            namespace: 'aws:elasticbeanstalk:managedactions',
            optionName: 'PreferredStartTime',
            value: 'Tue:17:00', // UTC 17:00 is GMT+8 01:00
          },
        ],
      },
    )

    env.addDependsOn(app)
  }
}
