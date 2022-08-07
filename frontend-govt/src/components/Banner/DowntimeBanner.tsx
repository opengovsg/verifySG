import { useQuery } from 'react-query'

import { EnvService } from '../../services/EnvService'

import Banner from '.'

import { EnvResDto } from '~shared/types/api'

const DowntimeMessage = () => (
  <span>
    It's not you, it's us. We are currently experiencing technical difficulties.
    Please try again later.
  </span>
)

export const DowntimeBanner: React.FC = (): JSX.Element | null => {
  const { data: envDto } = useQuery<EnvResDto>('env', EnvService.getEnv, {
    cacheTime: Infinity,
  })

  return envDto?.isDowntime ? (
    <Banner message={DowntimeMessage} background="red.500" />
  ) : null
}
