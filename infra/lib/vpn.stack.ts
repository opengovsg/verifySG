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

export type VpnStackConfig = {
}

type VPNStackProps = BaseStackProps & VpnStackConfig & {
  vpc: ec2.Vpc
  serverCertArn: string
  clientCertArn: string
  samlProviderArn: string
  vpnSecurityGroup: ec2.SecurityGroup,
}

export class VPNStack extends Stack {
  constructor(scope: Construct, id: string, props: VPNStackProps) {
    super(scope, id, props)
    
    if (!props.clientCertArn || !props.serverCertArn) {
      console.log('skipping VPN launch as certificates not provided')
      return
    }
    
    const logGroup = new logs.LogGroup(this, `${props.appNamePrefix}-ClientVpnLogGroup`, {
      retention: logs.RetentionDays.ONE_YEAR,
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
        securityGroupIds: [props.vpnSecurityGroup.securityGroupId],
        vpcId: props.vpc.vpcId,
        authenticationOptions: [
          {
            type: 'certificate-authentication',
            mutualAuthentication: {
              clientRootCertificateChainArn: clientCert.certificateArn,
            },
          },
          // TODO (Austin): Ask yuanruo to enable SSO access so that we can enable SAML login
          // {
          //   type: "federated-authentication",
          //   federatedAuthentication: {
          //     samlProviderArn: props.samlProviderArn
          //   }
          // }
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
      new CfnClientVpnTargetNetworkAssociation(
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
