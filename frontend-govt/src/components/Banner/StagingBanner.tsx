import { useState } from 'react'
import axios from 'axios'

import Banner from '.'

import { EnvDto } from '~shared/types'

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

  // set env once as env will not change in the same deployment
  axios.get<EnvDto>('/api/env').then((res) => {
    const { env } = res.data
    if (env) {
      setEnv(env)
    }
  })

  return env === 'development' ? (
    <Banner message={StagingBannerMessage} />
  ) : null
}
