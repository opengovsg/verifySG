import axios from 'axios'

import { StagingBannerMessage } from '../../constants/environment'
import { EnvDto } from '../../types/env'
import Banner from '../Banner'

export const StagingBanner: React.FC = (): JSX.Element => {
  axios.get<EnvDto>('/api/env').then((res) => {
    const { env } = res.data
    if (!env) {
      return
    }
  })

  return <Banner message={StagingBannerMessage} />
}
