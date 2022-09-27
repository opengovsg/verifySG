import { iam } from '@pulumi/aws'
import { Context } from './config'

interface CreateGithubArgs {
  repo: string
  branches: string[]
}

interface CreateGithubRes {
  role: iam.Role
}

export function createGithubOidc(
  { repo, branches }: CreateGithubArgs,
  { fullName }: Context,
): CreateGithubRes {
  const provider = new iam.OpenIdConnectProvider(`${fullName}-oidc-provider`, {
    clientIdLists: ['sts.amazonaws.com'],
    url: 'https://token.actions.githubusercontent.com',
    // This is not a secret. It is Github's thumbprint which is open information.
    thumbprintLists: ['6938fd4d98bab03faadb97b34396831e3780aea1'],
  })

  const role = new iam.Role(`${fullName}-github-actions-role`, {
    description: 'Allows Github Actions to access AWS resources through OIDC',
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            Federated: provider.arn,
          },
          Action: ['sts:AssumeRoleWithWebIdentity'],
          Condition: {
            StringEquals: {
              'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
            },
            'ForAnyValue:StringEquals': {
              'token.actions.githubusercontent.com:sub': branches.map(
                (branch) => `repo:${repo}:ref:refs/heads/${branch}`,
              ),
            },
          },
        },
      ],
    },
    // TODO: DANGEROUS!! Need to trim down the permission later
    managedPolicyArns: [iam.ManagedPolicy.AdministratorAccess],
  })

  return { role }
}
