import { aws_kms, RemovalPolicy, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { BaseStackProps } from '../infra.types'
import * as rds from 'aws-cdk-lib/aws-rds'
import { StorageType } from 'aws-cdk-lib/aws-rds'
import * as cdk from 'aws-cdk-lib'

type DatabaseStackProps = BaseStackProps & {
  vpc: ec2.Vpc
  databaseName?: string
  instanceType?: string 
  storageType?: StorageType
  allocatedStorage?: number
  maxAllocatedStorage?: number
  publiclyAccesible?: boolean
  databaseSg: ec2.SecurityGroup
  ec2Sg: ec2.SecurityGroup
}

export class DatabaseStack extends Stack {
  readonly dbInstance: rds.DatabaseInstance
  readonly storageEncryptionKey: aws_kms.Key

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props)

    // [!] KMS key
    this.storageEncryptionKey = new aws_kms.Key(this, 'kms', {
      removalPolicy: RemovalPolicy.RETAIN,
      alias: `${props.appNamePrefix}-key`
    })

    // [!] DB configuration
    this.dbInstance = new rds.DatabaseInstance(
      this,
      `${props.appNamePrefix}-db-instance`,
      {
        instanceIdentifier: `${props.appNamePrefix}-db-instance`,
        vpc: props.vpc,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        engine: rds.DatabaseInstanceEngine.postgres({
          version: rds.PostgresEngineVersion.VER_14_1,
        }),
        /**
         * See https://aws.amazon.com/ec2/instance-types/ for 
         * available instance types
         */
        instanceType: props.instanceType 
          ? new ec2.InstanceType(props.instanceType) 
          : new ec2.InstanceType('t3.micro'),
        databaseName: props.databaseName ?? props.appName,
        credentials: rds.Credentials.fromGeneratedSecret('postgres'),
        multiAz: true,
        allocatedStorage: props.allocatedStorage ?? 100,
        maxAllocatedStorage: props.maxAllocatedStorage ?? 1000,
        storageType: props.storageType ?? StorageType.GP2,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: true,
        deleteAutomatedBackups: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        securityGroups: [props.databaseSg],
        storageEncryptionKey: this.storageEncryptionKey,
        publiclyAccessible: props.publiclyAccesible ?? false,
      },
    )

    this.dbInstance.connections.allowFrom(props.ec2Sg, ec2.Port.tcp(5432))
  }
}
