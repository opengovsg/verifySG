import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BaseStackProps } from '../infra.types'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

export class AcmStack extends Stack {
  readonly sslCert: acm.Certificate

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props)

    // [!] ACM
    this.sslCert = new acm.Certificate(
      this,
      `${props.appNamePrefix}-ssl-certificate`,
      {
        domainName: `${props.environment}.${props.app}.gov.sg`,
        validation: acm.CertificateValidation.fromEmail(),
      },
    )
  }
}
