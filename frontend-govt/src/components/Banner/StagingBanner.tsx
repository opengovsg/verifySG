import { useState } from 'react'
import axios from 'axios'

import { EnvDto } from '../../types/env'

import Banner from '.'

const ProductionUrl = 'https://checkwho.gov.sg/login'
const StagingBannerMessage = () => (
  <span>
    You are currently on the staging version of CheckWho, which can only send
    Singpass notifications to specially provisioned staging accounts. Please
    find the production version <a href={ProductionUrl}>here</a>.
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

  return env === 'staging' ? <Banner message={StagingBannerMessage} /> : null
}
