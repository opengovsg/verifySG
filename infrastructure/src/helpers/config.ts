import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'

interface DefaultTags {
  tags: {
    project: string
    env: string
    team: string
  }
}

export interface Context {
  project: string
  env: 'production' | 'staging'
  team: string
  fullName: string
  vpc: awsx.ec2.Vpc | null
}

export function loadContext(): Context {
  const config = new pulumi.Config('aws')
  const {
    tags: { project, env, team },
  } = config.requireObject<DefaultTags>('defaultTags')
  if (!project || !env || !team)
    throw new Error(
      'Some of the required AWS provider default tags are not set',
    )

  if (!(env === 'production' || env === 'staging'))
    throw new Error('Invalid env')

  return {
    project,
    env,
    team,
    fullName: `${project}-${env}`,
    vpc: null,
  }
}
