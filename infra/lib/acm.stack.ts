import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseStackProps } from '../infra.types'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'


type AcmStackProps = BaseStackProps & {
  domainName?: string
}

export class AcmStack extends Stack {
  readonly sslCert: acm.Certificate

  constructor(scope: Construct, id: string, props: AcmStackProps) {
    super(scope, id, props)

    // [!] ACM
    this.sslCert = new acm.Certificate(
      this,
      `${props.appNamePrefix}-ssl-certificate`,
      {
        domainName: props.domainName ?? `${props.environment}.${props.appName}.gov.sg`,
        validation: acm.CertificateValidation.fromEmail(),
      },
    )
  }
}
