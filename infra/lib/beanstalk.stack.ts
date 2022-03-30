import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { BaseStackProps } from '../infra.types'
import * as cdk from 'aws-cdk-lib'
import * as elasticbeanstalk from 'aws-cdk-lib/aws-elasticbeanstalk'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

type BeanstalkStackProps = BaseStackProps & {
  vpc: ec2.Vpc
  publicSubnetIds: string[]
  ec2SubnetIds: string[]
  securityGroup: ec2.SecurityGroup
  platform?: string
  solutionStackName?: string
  minInstances?: string
  maxInstances?: string
  sslCert: acm.Certificate,
}

export class BeanstalkStack extends Stack {
  constructor(scope: Construct, id: string, props: BeanstalkStackProps) {
    super(scope, id, props)

    const platform = props.platform ?? this.node.tryGetContext('platform')

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
        platformArn: platform,
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
            namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
            optionName: 'StreamLogs',
            value: 'true',
          },
          {
            namespace: 'aws:elasticbeanstalk:cloudwatch:logs',
            optionName: 'RetentionInDays',
            value: '365',
          },
          {
            namespace: 'aws:elasticbeanstalk:environment',
            optionName: 'LoadBalancerType',
            value: 'application',
          },
          {
            namespace: 'aws:autoscaling:asg',
            optionName: 'MinSize',
            value: props.minInstances ?? '1',
          },
          {
            namespace: 'aws:autoscaling:asg',
            optionName: 'MaxSize',
            value: props.maxInstances ?? '10',
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
          {
            namespace: 'aws:autoscaling:launchconfiguration',
            optionName: 'SecurityGroups',
            value: props.securityGroup.securityGroupId,
          },
        ],
      },
    )

    env.addDependsOn(app)
  }
}
