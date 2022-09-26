import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as pulumi from '@pulumi/pulumi'
import { Context } from './config'

interface CreateEcsArgs {}

interface CreateEcsRes {
  alb: awsx.elasticloadbalancingv2.ApplicationLoadBalancer
  cluster: awsx.ecs.Cluster
  service: awsx.ecs.Service
  mainListener: awsx.elasticloadbalancingv2.Listener
}

export function createEcs(
  args: CreateEcsArgs,
  { fullName, vpc }: Context,
): CreateEcsRes {
  if (!vpc) throw new Error('vpc required')

  const cluster = new awsx.ecs.Cluster(`${fullName}-cluster`, { vpc })

  const alb = new awsx.elasticloadbalancingv2.ApplicationLoadBalancer(
    `${fullName}-lb`,
    {
      vpc,
      external: true,
      securityGroups: cluster.securityGroups,
      subnets: vpc.publicSubnetIds,
    },
  )

  const blueTg = alb.createTargetGroup(`${fullName}-blue`, {
    vpc,
    port: 80,
    deregistrationDelay: 0,
  })
  const mainListener = blueTg.createListener(`${fullName}-main-listener`, {
    port: 80,
  })

  const greenTg = alb.createTargetGroup(`${fullName}-green`, {
    vpc,
    port: 80,
    deregistrationDelay: 0,
  })

  const service = new awsx.ecs.FargateService(`${fullName}-service`, {
    cluster,
    taskDefinitionArgs: {
      container: {
        image: 'nginx',
        portMappings: [mainListener],
      },
    },
    desiredCount: 1,
    deploymentController: {
      type: 'CODE_DEPLOY',
    },
  })

  const autoScalingTarget = new aws.appautoscaling.Target(
    `${fullName}-ecs-target`,
    {
      maxCapacity: 4,
      minCapacity: 1,
      resourceId: pulumi.interpolate`service/${cluster.cluster.name}/${service.service.name}`,
      scalableDimension: 'ecs:service:DesiredCount',
      serviceNamespace: 'ecs',
    },
  )
  const autoScalingPolicy = new aws.appautoscaling.Policy(
    `${fullName}-ecs-policy`,
    {
      policyType: 'TargetTrackingScaling',
      resourceId: autoScalingTarget.resourceId,
      scalableDimension: autoScalingTarget.scalableDimension,
      serviceNamespace: autoScalingTarget.serviceNamespace,
      targetTrackingScalingPolicyConfiguration: {
        predefinedMetricSpecification: {
          predefinedMetricType: 'ECSServiceAverageCPUUtilization',
        },
        targetValue: 50,
      },
    },
  )

  const codeDeployRole = new aws.iam.Role('codeDeployRole', {
    assumeRolePolicy: {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: '',
          Effect: 'Allow',
          Principal: {
            Service: 'codedeploy.amazonaws.com',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    },
    managedPolicyArns: [aws.iam.ManagedPolicy.AWSCodeDeployRoleForECS],
  })

  const application = new aws.codedeploy.Application(`${fullName}-app`, {
    computePlatform: 'ECS',
  })
  const deploymentGroup = new aws.codedeploy.DeploymentGroup(
    'deploymentGroup',
    {
      appName: application.name,
      deploymentConfigName: 'CodeDeployDefault.ECSAllAtOnce',
      deploymentGroupName: `${fullName}-dg`,
      serviceRoleArn: codeDeployRole.arn,
      autoRollbackConfiguration: {
        enabled: true,
        events: ['DEPLOYMENT_FAILURE'],
      },
      blueGreenDeploymentConfig: {
        deploymentReadyOption: {
          actionOnTimeout: 'CONTINUE_DEPLOYMENT',
        },
        terminateBlueInstancesOnDeploymentSuccess: {
          action: 'TERMINATE',
          terminationWaitTimeInMinutes: 5,
        },
      },
      deploymentStyle: {
        deploymentOption: 'WITH_TRAFFIC_CONTROL',
        deploymentType: 'BLUE_GREEN',
      },
      ecsService: {
        clusterName: cluster.cluster.name,
        serviceName: service.service.name,
      },
      loadBalancerInfo: {
        targetGroupPairInfo: {
          prodTrafficRoute: {
            listenerArns: [mainListener.listener.arn],
          },
          targetGroups: [
            {
              name: blueTg.targetGroup.name,
            },
            {
              name: greenTg.targetGroup.name,
            },
          ],
        },
      },
    },
  )

  return {
    alb,
    cluster,
    service,
    mainListener,
  }
}
