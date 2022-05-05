import { StackProps } from "aws-cdk-lib";

export type BaseStackProps = StackProps & {
  appName: string
  environment: string
  appNamePrefix: string
  env: {
    accountId: string
    region: string
  }
}
}