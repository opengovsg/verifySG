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
  {
    id: 'ECDA',
    name: 'Early Childhood Development Agency',
    logoUrl: 'https://file.go.gov.sg/checkwho-ecda-logo.png',
    emailDomains: ['ecda.gov.sg'],
  },
  {
    id: 'IRAS',
    name: 'Inland Revenue Authority of Singapore',
    logoUrl: 'https://file.go.gov.sg/iras-logo.png',
    emailDomains: ['iras.gov.sg'],
  },
  {
    id: 'MOH',
    name: 'Ministry of Health',
    logoUrl: 'https://file.go.gov.sg/moh-logo.png',
    emailDomains: ['moh.gov.sg'],
  },
  {
    id: 'MSF',
    name: 'Ministry of Social and Family Development',
    logoUrl: 'https://file.go.gov.sg/checkwho-msf-logo.png',
    emailDomains: ['msf.gov.sg'],
  },
]
