import { useState } from 'react'
import { useQuery } from 'react-query'

import { EnvService } from '../../services/EnvService'

import Banner from '.'

const ProductionUrl = 'https://checkwho.gov.sg/login'
const StagingBannerMessage = () => (
  <span>
    Staging CheckWho can only send notifications to specially provisioned
    Singpass accounts. To notify live Singpass accounts, click{' '}
    <a href={ProductionUrl}>
      <u>here</u>
    </a>
    .
  </span>
)

export const StagingBanner: React.FC = (): JSX.Element | null => {
  const [env, setEnv] = useState<string>('')

  // call env once as env will not change in the same deployment
  useQuery('env', EnvService.getEnv, {
    cacheTime: Infinity,
    onSuccess: ({ env }) => {
      setEnv(env)
    },
  })

  return env === 'development' ? (
    <Banner message={StagingBannerMessage} />
  ) : null
}
