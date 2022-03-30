import * as cdk from 'aws-cdk-lib'

type EnvVars = [string, string]

type LaunchConfig = {
    namespace: string,
    optionName: string,
    value: string
}

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

export const getEnvironmentLaunchConfigs = (envVars: EnvVars[]) => {
    const beanstalkConfigs: cdk.aws_elasticbeanstalk.CfnEnvironment.OptionSettingProperty[] = []

    for (const envVariable of envVars) {
        const [key, val] = envVariable
        const parsedKey = camelToSnakeCase(key).toUpperCase() // TODO: to clean up

        beanstalkConfigs.push({
            namespace: "aws:elasticbeanstalk:application:environment",
            optionName: parsedKey,
            value: val,
        })
    }

    return beanstalkConfigs
}
