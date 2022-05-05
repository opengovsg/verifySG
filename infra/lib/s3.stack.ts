import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs/lib/construct'
import { BaseStackProps } from '../infra.types'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'

export type S3StackConfig = {
}

type S3StackProps = BaseStackProps & S3StackConfig 

export class S3Stack extends Stack {
  readonly bucket: s3.Bucket

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props)

    const bucketName = `${props.appName}-access-logs`
    const bucketPrefix = `${props.environment}`
    const awsAccountId = `${props.env.accountId}`
    const elbAccountId = 114774131450 // https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/enable-access-logs.html

    this.bucket = new s3.Bucket(this, bucketName, {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    })
    this.bucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['s3:PutObject'],
      resources: [`arn:aws:s3:::${this.bucket.bucketName}/${bucketPrefix}/AWSLogs/${awsAccountId}/*`],
      principals: [new iam.AccountPrincipal(elbAccountId)], 
    }));
  }
}
