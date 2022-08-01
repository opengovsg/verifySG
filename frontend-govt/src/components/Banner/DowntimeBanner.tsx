import { useQuery } from 'react-query'

import { EnvService } from '../../services/EnvService'

import Banner from '.'

import { EnvDto } from '~shared/types'

const DowntimeMessage = () => (
  <span>
    It's not you, it's us. One of our services is currently experiencing
    technical difficulties. Please try again later.
  </span>
)

export const DowntimeBanner: React.FC = (): JSX.Element | null => {
  const { data: envDto } = useQuery<EnvDto>('env', EnvService.getEnv, {
    cacheTime: Infinity,
  })

  return envDto?.isDowntime ? (
    <Banner message={DowntimeMessage} background="red.500" />
  ) : null
}
