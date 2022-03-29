import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { BaseStackProps } from '../infra.types'
import { Peer } from 'aws-cdk-lib/aws-ec2'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

export class CoreStack extends Stack {
  readonly vpc: ec2.Vpc
  readonly privateSubnetsIds: string[]
  readonly publicSubnetIds: string[]
  readonly securityGroups: {
    [key: string]: ec2.SecurityGroup
  }

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props)

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
    const sgVpn = new ec2.SecurityGroup(
      this,
      `${props.appNamePrefix}-vpn`,
      {
        vpc: this.vpc,
        securityGroupName: `${props.appNamePrefix}-vpn`,
      },
    )

    const sgBastion = new ec2.SecurityGroup(
      this,
      `${props.appNamePrefix}-bastion`,
      {
        vpc: this.vpc,
        securityGroupName: `${props.appNamePrefix}-bastion`,
      },
    )

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

    sgRds.addIngressRule(
      sgBastion,
      ec2.Port.tcp(5432),
      'allow inbound traffic from bastion host',
    )

    sgRds.addIngressRule(
      sgVpn,
      ec2.Port.tcp(5432),
      'allow inbound traffic from vpn',
    )

    sgEc2.addIngressRule(
      sgBastion,
      ec2.Port.tcp(22),
      'allow inbound traffic from bastion host',
    )

    this.securityGroups = {
      ec2: sgEc2,
      rds: sgRds,
      bastion: sgBastion,
      vpn: sgVpn,
    }
  }
}
