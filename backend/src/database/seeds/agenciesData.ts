import { AgencyDto } from '~shared/types/api'

class AgencyData extends AgencyDto {
  emailDomains: string[] // in theory, can further validate these are valid .gov.sg domains
}

export const agenciesData: AgencyData[] = [
  {
    id: 'OGP',
    name: 'Open Government Products',
    logoUrl: 'https://file.go.gov.sg/checkwho-ogp.png',
    emailDomains: ['open.gov.sg'],
  },
  {
    id: 'SPF',
    name: 'Singapore Police Force',
    logoUrl: 'https://file.go.gov.sg/spf-logo.png',
    emailDomains: ['spf.gov.sg'],
  },
]
