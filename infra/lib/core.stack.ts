import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { BaseStackProps } from '../infra.types'
import { Peer } from 'aws-cdk-lib/aws-ec2'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

export class CoreStack extends Stack {
  readonly sslCert: acm.Certificate;
  readonly vpc: ec2.Vpc
  readonly privateSubnetsIds: string[]
  readonly publicSubnetIds: string[]
  readonly securityGroups: {
    ec2: ec2.SecurityGroup
    rds: ec2.SecurityGroup
  }

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props)

    // [!] ACM
    this.sslCert = new acm.Certificate(
      this,
      `${props.appNamePrefix}-certificate`,
      {
        domainName: `${props.environment}.${props.app}.gov.sg`,
        validation: acm.CertificateValidation.fromDns(),
      },
    )

    // [!] VPC Configuration
    this.vpc = new ec2.Vpc(this, `${props.appNamePrefix}-vpc`, {
      cidr: '172.31.0.0/16', // TODO: move to config
      natGateways: 1,
      enableDnsHostnames: true,
      enableDnsSupport: true,
      vpcName: `${props.appNamePrefix}-vpc`,
      maxAzs: 99,
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
          name: `${props.appNamePrefix}-rds`,
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          cidrMask: 24,
          name: `${props.appNamePrefix}-ec2`,
          subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 24,
          name: `${props.appNamePrefix}-public`,
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    })

    this.privateSubnetsIds = this.vpc.privateSubnets.map(
      (subnet) => subnet.subnetId,
    )
    this.publicSubnetIds = this.vpc.publicSubnets.map(
      (subnet) => subnet.subnetId,
    )

    // [!] SG configs
    const sgEc2 = new ec2.SecurityGroup(this, `${props.appNamePrefix}-ec2`, {
      vpc: this.vpc,
      securityGroupName: `${props.appNamePrefix}-ec2`,
    })

    sgEc2.addIngressRule(Peer.anyIpv4(), ec2.Port.tcp(443))

    const sgRds = new ec2.SecurityGroup(this, `${props.appNamePrefix}-rds`, {
      vpc: this.vpc,
      securityGroupName: `${props.appNamePrefix}-rds`,
    })

    sgRds.addIngressRule(
      sgEc2,
      ec2.Port.tcp(5432),
      'allow inbound traffic from ec2',
    )

    this.securityGroups = {
        ec2: sgEc2,
        rds: sgRds,
    }
  }
}
