import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs/lib/construct'
import { BaseStackProps } from '../infra.types'
import * as ec2 from 'aws-cdk-lib/aws-ec2'

type BastionStackProps = BaseStackProps & {
  vpc: ec2.Vpc
  bastionSecurityGroup: ec2.SecurityGroup
}

export class BastionStack extends Stack {
  readonly bastionHost: ec2.BastionHostLinux

  constructor(scope: Construct, id: string, props: BastionStackProps) {
    super(scope, id, props)

    this.bastionHost = new ec2.BastionHostLinux(
      this,
      `${props.appNamePrefix}-BastionHost`,
      {
        vpc: props.vpc,
        securityGroup: props.bastionSecurityGroup,
      },
    )
  }
}
