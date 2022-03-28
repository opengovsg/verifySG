import { aws_kms, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as elasticbeanstalk from 'aws-cdk-lib/aws-elasticbeanstalk'
import config from '../config'
import { StorageType } from 'aws-cdk-lib/aws-rds'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// import config env vars
const APPLICATION_NAME = config.get('applicationName')
const ENVIRONMENT = config.get('environment')
const DB_NAME = config.get('database.name')
const PREFIX = `${APPLICATION_NAME}-${ENVIRONMENT}`

export class CheckWhoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // [!] VPC Configuration
    const vpc = new ec2.Vpc(this, `${PREFIX}-vpc`, {
      cidr: '172.31.0.0/16', // TODO: move to config
      natGateways: 1,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: `${PREFIX}-vpc`,
      maxAzs: 99, //
      /**
       * Each entry in this list configures a Subnet Group
       *
       * ISOLATED: Isolated Subnets do not route traffic to the Internet (in this VPC).
       * PRIVATE.: Subnet that routes to the internet, but not vice versa.
       * PUBLIC..: Subnet connected to the Internet.
       */
      /**
       * IP address ranges are automatically assigned by
       * https://github.com/aws/aws-cdk/issues/3562
       */
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: `${PREFIX}-rds`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 24,
          name: `${PREFIX}-ec2`,
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: `${PREFIX}-public`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    })

    // [!] VPC Security Groups
    const sgEc2 = new ec2.SecurityGroup(
      this,
      `${PREFIX}-ec2`,
      {
        vpc: vpc,
        securityGroupName: `${PREFIX}-ec2`,
      },
    )

    const sgRds = new ec2.SecurityGroup(
      this,
      `${PREFIX}-rds`,
      {
        vpc: vpc,
        securityGroupName: `${PREFIX}-rds`,
      },
    )

    sgRds.addIngressRule(
      sgEc2,
      ec2.Port.tcp(5432),
      'allow inbound traffic from ec2',
    )

    // [!] KMS key
    const key = new aws_kms.Key(this, 'kms', {
      removalPolicy: RemovalPolicy.DESTROY,
    })

    // [!] DB configuration
    const dbInstance = new rds.DatabaseInstance(
      this,
      `${APPLICATION_NAME}-db-instance`,
      {
        vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_14_1,
        }),
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE3,
          ec2.InstanceSize.MICRO,
        ),
        databaseName: DB_NAME,
        credentials: rds.Credentials.fromGeneratedSecret('postgres'),
        multiAz: false,
        allocatedStorage: 100,
        storageType: StorageType.STANDARD,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: true,
        deleteAutomatedBackups: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        deletionProtection: false,
        securityGroups: [sgRds],
        storageEncryptionKey: key,
        publiclyAccessible: false,
      },
    )

    // [!] ACM
    const certificate = new acm.Certificate(
      this,
      `${PREFIX}-certificate`,
      {
        domainName: `${ENVIRONMENT}.${APPLICATION_NAME}.gov.sg`,
        validation: acm.CertificateValidation.fromDns(),
      },
    )

    const EbInstanceRole = new cdk.aws_iam.Role(
      this,
      `${APPLICATION_NAME}-aws-elasticbeanstalk-ec2-role`,
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal('ec2.amazonaws.com'),
      },
    )

    const managedPolicy = cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
      'AWSElasticBeanstalkWebTier',
    )
    EbInstanceRole.addManagedPolicy(managedPolicy)

    const profileName = `${APPLICATION_NAME}-InstanceProfile`
    const instanceProfile = new cdk.aws_iam.CfnInstanceProfile(
      this,
      profileName,
      {
        instanceProfileName: profileName,
        roles: [EbInstanceRole.roleName],
      },
    )

    // beanstalk stuff
    const node = this.node
    const platform = node.tryGetContext('platform')

    const app = new elasticbeanstalk.CfnApplication(
      this,
      `${PREFIX}-application`,
      { applicationName: `${PREFIX}-application` },
    )

    const env = new elasticbeanstalk.CfnEnvironment(
      this,
      `${PREFIX}-environment`,
      {
        environmentName: `${PREFIX}-environment`,
        platformArn: platform,
        applicationName: `${PREFIX}-application`,
        optionSettings: [
          {
            namespace: 'aws:autoscaling:launchconfiguration',
            optionName: 'IamInstanceProfile',
            value: profileName,
          },
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'VPCId',
            value: vpc.vpcId,
          },
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'Subnets',
            value: vpc.privateSubnets
              .map((subnet) => subnet.subnetId)
              .join(','),
          },
          {
            namespace: 'aws:autoscaling:launchconfiguration',
            optionName: 'SecurityGroups',
            value: sgEc2.securityGroupId,
          },
        ],
      },
    )

    env.addDependsOn(app)

    // S3 Bucket
    new s3.Bucket(this, `${APPLICATION_NAME}-bucket`, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
