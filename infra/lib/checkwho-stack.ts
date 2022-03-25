import { aws_kms, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as elasticbeanstalk from 'aws-cdk-lib/aws-elasticbeanstalk'
import config from '../config'
import { StorageType } from 'aws-cdk-lib/aws-rds'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// import config env vars
const APPLICATION_NAME = config.get('applicationName')
const ENVIRONMENT_NAME = config.get('environment')
const DB_NAME = config.get('database.name')

export class CheckWhoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // [!] VPC Configuration
    const vpc = new ec2.Vpc(
      this,
      `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-vpc`,
      {
        cidr: '172.31.0.0/16', // TODO: move to config
        natGateways: 1,
        enableDnsHostnames: true,
        enableDnsSupport: true,
        vpcName: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-vpc`,
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
            name: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-rds`,
            subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          },
          {
            cidrMask: 24,
            name: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-ec2`,
            subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
          },
          {
            cidrMask: 24,
            name: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-public`,
            subnetType: ec2.SubnetType.PUBLIC,
          },
        ],
      },
    )

    // [!] VPC Security Groups
    const sgEc2 = new ec2.SecurityGroup(
      this,
      `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-ec2`,
      {
        vpc: vpc,
        securityGroupName: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-ec2`,
      },
    )

    const sgRds = new ec2.SecurityGroup(
      this,
      `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-rds`,
      {
        vpc: vpc,
        securityGroupName: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-rds`,
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
    const stagingCert = new acm.Certificate(
      this,
      `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-certificate`,
      {
        domainName: 'staging.checkwho.gov.sg',
        validation: acm.CertificateValidation.fromDns(),
      },
    )

    // beanstalk stuff
    const app = new elasticbeanstalk.CfnEnvironment(
      this,
      `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-beanstalk`,
      {
        environmentName: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-beanstalk`,
        solutionStackName: `${APPLICATION_NAME}_SOLUTION_STACK`,
        applicationName: APPLICATION_NAME,
        optionSettings: [
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'VPCId',
            value: vpc.vpcId,
          },
          {
            namespace: 'aws:ec2:vpc',
            optionName: 'Subnets',
            value: `${APPLICATION_NAME}-${ENVIRONMENT_NAME}-ec2`,
          },
          {
            namespace: 'aws:autoscaling:launchconfiguration',
            optionName: 'SecurityGroups',
            value: sgEc2.securityGroupId,
          },
        ],
      },
    )

    // // [!] ECR
    // const repository = new ecr.Repository(this, 'Repository')

    // to do after setting up eb
    // const eb = dbInstance.connections.allowFrom(app., ec2.Port.tcp(5432))

    // example S3 bucket
    new s3.Bucket(this, `${APPLICATION_NAME}-bucket`, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
