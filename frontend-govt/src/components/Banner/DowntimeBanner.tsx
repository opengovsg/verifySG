import { useEffect, useState } from 'react'
import axios from 'axios'

import Banner from '.'

import { EnvDto } from '~shared/types'

const DowntimeMessage = () => (
  <span>
    It's not you, it's us. One of our services is currently experiencing
    technical difficulties. Please try again later.
  </span>
)

export const DowntimeBanner: React.FC = (): JSX.Element | null => {
  const [isDowntime, setIsDowntime] = useState<boolean>(false)

  useEffect(() => {
    axios.get<EnvDto>('/api/env').then((res) => {
      const { isDowntime } = res.data
      if (isDowntime) {
        setIsDowntime(isDowntime)
      }
    })
  }, [])

  return isDowntime ? (
    <Banner message={DowntimeMessage} background="red.500" />
  ) : null
}
