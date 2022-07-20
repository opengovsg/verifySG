import { useState } from 'react'

import Banner from '.'

const DowntimeMessage = () => (
  <span>
    It's not you. It's us. One of our services is currently experiencing
    technical difficulties.
  </span>
)

export const DowntimeBanner: React.FC = (): JSX.Element | null => {
  const [isDowntime, setIsDowntime] = useState<boolean>(false)

  // Possible TODO: Call SGNotify API to check if there is a downtime
  // TBC if this is too many calls to the API

  return isDowntime ? (
    <Banner message={DowntimeMessage} background="red.500" />
  ) : null
}
