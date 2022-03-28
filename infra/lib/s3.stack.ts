import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs/lib/construct'
import { BaseStackProps } from '../infra.types'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'

export class S3Stack extends Stack {
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props)
    new s3.Bucket(this, `${props.appNamePrefix}-bucket`, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })
  }
}
