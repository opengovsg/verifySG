import * as cdk from 'aws-cdk-lib'

type EnvVars = {
    [key: string]: string
}

type LaunchConfig = {
    namespace: string,
    option_name: string,
    value: string
}

export const getEnvironmentLaunchConfigs = (envVars: EnvVars[]) => {
    const beanstalkConfigs: cdk.aws_elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] = []

    for (const envVariable of envVars) {
        const [optionName, value] = Object.values(envVariable)
        beanstalkConfigs.push({
            "namespace": "aws:elasticbeanstalk:application:environment",
            optionName,
            value,
        })
    }

    return beanstalkConfigs
}
