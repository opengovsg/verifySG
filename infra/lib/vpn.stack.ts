import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs/lib/construct'
import { BaseStackProps } from '../infra.types'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as certManager from 'aws-cdk-lib/aws-certificatemanager'
import {
  CfnClientVpnAuthorizationRule,
  CfnClientVpnEndpoint,
  CfnClientVpnTargetNetworkAssociation,
} from 'aws-cdk-lib/aws-ec2'

type VPNStackProps = BaseStackProps & {
  vpc: ec2.Vpc
  serverCertArn: string
  clientCertArn: string
  samlProviderArn: string
}

export class VPNStack extends Stack {
  constructor(scope: Construct, id: string, props: VPNStackProps) {
    super(scope, id, props)
    const logGroup = new logs.LogGroup(this, 'ClientVpnLogGroup', {
      retention: logs.RetentionDays.ONE_MONTH,
    })

    const logStream = logGroup.addStream('ClientVpnLogStream')

    const clientCert = certManager.Certificate.fromCertificateArn(
      this,
      'ClientCertificate',
      props.clientCertArn,
    )
    const serverCert = certManager.Certificate.fromCertificateArn(
      this,
      'ServerCertificate',
      props.serverCertArn,
    )

    const endpoint = new CfnClientVpnEndpoint(
      this,
      `${props.appNamePrefix}-clientVpnEndpoint`,
      {
        description: 'VPN',
        authenticationOptions: [
          {
            type: 'certificate-authentication',
            mutualAuthentication: {
              clientRootCertificateChainArn: clientCert.certificateArn,
            },
          },
        ],
        tagSpecifications: [
          {
            resourceType: 'client-vpn-endpoint',
            tags: [
              {
                key: 'Name',
                value: `${props.appNamePrefix}-vpn`,
              },
            ],
          },
        ],
        clientCidrBlock: '10.1.132.0/22',
        connectionLogOptions: {
          enabled: true,
          cloudwatchLogGroup: logGroup.logGroupName,
          cloudwatchLogStream: logStream.logStreamName,
        },
        serverCertificateArn: serverCert.certificateArn,
        splitTunnel: true,
        dnsServers: ['8.8.8.8', '8.8.4.4'],
      },
    )

    let i = 0
    props.vpc.isolatedSubnets.map((subnet) => {
      let assoc = new CfnClientVpnTargetNetworkAssociation(
        this,
        `${props.appNamePrefix}-IsolatedSubnet-ClientVpnNetworkAssociation-` + i,
        {
          clientVpnEndpointId: endpoint.ref,
          subnetId: subnet.subnetId,
        },
      )
      i++
    })

    new CfnClientVpnAuthorizationRule(
      this,
      `${props.appNamePrefix}-ClientVpnAuthRule`,
      {
        clientVpnEndpointId: endpoint.ref,
        targetNetworkCidr: '0.0.0.0/0',
        authorizeAllGroups: true,
        description: 'Allow all',
      },
    )
  }
}
