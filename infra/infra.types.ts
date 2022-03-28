import { StackProps } from "aws-cdk-lib";

export type BaseStackProps = StackProps & {
    app: string,
    environment: string,
    appNamePrefix: string,
}