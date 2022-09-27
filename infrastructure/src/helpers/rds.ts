import { ec2, rds } from '@pulumi/aws'
import { Context } from './config'

interface CreateRdsArgs {}

interface CreateRdsRes {}

export function createRds(
  args: CreateRdsArgs,
  { project, fullName, vpc }: Context,
): CreateRdsRes {
  if (!vpc) throw new Error('vpc required')

  //   console.log(`${fullName}-cluster`.toLowerCase())

  const subnetGroup = new rds.SubnetGroup(`${fullName}-sng`.toLowerCase(), {
    subnetIds: vpc.isolatedSubnetIds,
  })

  const securityGroup = new ec2.SecurityGroup(`${fullName}-rds-sg`, {
    description: `Guards RDS components for ${fullName}`,
    vpcId: vpc.id,
    ingress: [
      {
        description: 'RDS Proxy to RDS Cluster/Instances',
        fromPort: 5432,
        toPort: 5432,
        protocol: 'tcp',
        self: true,
      },
    ],
    egress: [
      {
        fromPort: 0,
        toPort: 0,
        protocol: '-1',
        cidrBlocks: ['0.0.0.0/0'],
        ipv6CidrBlocks: ['::/0'],
      },
    ],
  })
  const rdsCluster = new rds.Cluster(`${fullName}-cluster`, {
    clusterIdentifier: `${fullName}-cluster`.toLowerCase(),
    dbSubnetGroupName: subnetGroup.name,
    deletionProtection: true,
    engine: 'aurora-postgresql',
    engineMode: 'provisioned',
    engineVersion: '14.3',
    masterUsername: 'master',
    masterPassword: 'ffffdddd',
    storageEncrypted: true,
    vpcSecurityGroupIds: [securityGroup.id],
  })
  const instance = new rds.ClusterInstance(`${fullName}-instance-1`, {
    //   instanceClass:
    //   dbName: project.toLowerCase(),
    clusterIdentifier: rdsCluster.clusterIdentifier,
    //   dbSubnetGroupName: subnetGroup.name,
    //   deletionProtection: true,
    //   enabledCloudwatchLogsExports: ['postgresql', 'upgrade'],
    engine: 'aurora-postgresql',
    engineVersion: '14.3',
    identifier: `${fullName}-instance-1`.toLowerCase(),
    instanceClass: 'db.t3.medium',
    // monitoringInterval: 5,
    // monitoringRoleArn: ,// todo
    performanceInsightsEnabled: true,
    performanceInsightsRetentionPeriod: 731,
  })
  return {}
}
