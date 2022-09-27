import * as pulumi from '@pulumi/pulumi'

import {
  createEcs,
  createGithubOidc,
  createRds,
  createVpc,
  loadContext,
} from './src/helpers'

const context = loadContext()

const github = createGithubOidc(
  { repo: 'opengovsg/CheckWho', branches: ['develop', 'feat/pulumi'] },
  context,
)

export const githubActionsRoleArn = github.role.arn

const vpc = createVpc({ secondOctet: 4 }, context)

context.vpc = vpc

const { alb, cluster, service, mainListener } = createEcs({}, context)

export const url = pulumi.interpolate`${alb.loadBalancer.dnsName}`

createRds({}, context)
