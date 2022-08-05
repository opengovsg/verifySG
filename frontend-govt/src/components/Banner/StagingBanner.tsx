import { useQuery } from 'react-query'

import { EnvService } from '../../services/EnvService'

import Banner from '.'

import { EnvResDto } from '~shared/types/api'

const productionUrl = 'https://checkwho.gov.sg/login'
const StagingBannerMessage = () => (
  <span>
    Staging CheckWho can only send notifications to specially provisioned
    Singpass accounts. To notify live Singpass accounts, click{' '}
    <a href={productionUrl}>
      <u>here</u>
    </a>
    .
  </span>
)

export const StagingBanner: React.FC = (): JSX.Element | null => {
  const { data: envDto } = useQuery<EnvResDto>('env', EnvService.getEnv, {
    cacheTime: Infinity,
  })

  return envDto?.env === 'staging' ? (
    <Banner message={StagingBannerMessage} />
  ) : null
}
