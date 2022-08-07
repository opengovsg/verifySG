import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { Skeleton } from '@chakra-ui/react'

import { WELCOME_ROUTE } from '../../constants/routes'
import { OfficerService } from '../../services/OfficerService'

export const ProfileGuard: React.FC = ({ children }) => {
  const [hasLoaded, setHasLoaded] = useState(false)
  const history = useHistory()

  useQuery('profile', OfficerService.getOfficer, {
    onSuccess: ({ name, position }) => {
      if (!name || !position) history.push(WELCOME_ROUTE)
      setHasLoaded(true)
    },
  })
  // only render children if profile is loaded
  return <Skeleton isLoaded={hasLoaded}>{children}</Skeleton>
}
