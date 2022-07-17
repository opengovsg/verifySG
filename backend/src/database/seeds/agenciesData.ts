// TODO: include field validators after shared folder is set up

interface AgencyData {
  id: string
  name: string
  logoUrl: string
  emailDomains: string[]
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
